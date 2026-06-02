/**
 * faceFilterBase.ts
 * ------------------------------------------------------------------------------------------------
 * Shared engine for real-time "funny face" filters.
 *
 * Provides:
 *  - MediaPipe Face Landmarker setup (468 landmarks, GPU delegate, VIDEO mode).
 *  - A reusable WebGL2 warp renderer driven by a generic control-point buffer.
 *  - Temporal smoothing of control points.
 *
 * A concrete filter only needs to:
 *  - subclass BaseFaceFilter
 *  - implement buildControlPoints(landmarks) -> fill this.points / set this.activeCount
 *  - (optionally) override the fragment-shader displacement model via getDisplacementGLSL()
 *
 * Each control point is 6 floats: [cx, cy, dirX, dirY, radius, strength].
 * The default shader treats them as radial "bloat/pinch" sources (positive strength = bloat,
 * negative = pinch). Filters that need other math (swirl, etc.) override getDisplacementGLSL().
 *
 * Dependency:  npm i @mediapipe/tasks-vision
 * ------------------------------------------------------------------------------------------------
 */

import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

export const MAX_POINTS = 32;
export const STRIDE = 6; // floats per control point

export interface BaseFilterOptions {
  intensity?: number; // 0..1 master strength
  smoothing?: number; // 0..1 temporal smoothing
  mirror?: boolean; // selfie mirror
  radiusScale?: number; // multiplies inter-ocular-distance based radii
}

export type Landmarks = NormalizedLandmark[];

/** Common landmark indices (FaceMesh 468 topology). */
export const IDX = {
  anchor: 168, // nose bridge / between eyes
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  leftEyeInner: 133,
  rightEyeInner: 362,
  leftIris: 468, // requires refineLandmarks; falls back gracefully
  rightIris: 473,
  noseTip: 1,
  chin: 152,
  forehead: 10,
  mouthCenter: 13,
  leftEyeTop: 159,
  leftEyeBottom: 145,
  rightEyeTop: 386,
  rightEyeBottom: 374,
} as const;

export abstract class BaseFaceFilter {
  protected readonly video: HTMLVideoElement;
  protected readonly canvas: HTMLCanvasElement;
  protected intensity: number;
  protected smoothing: number;
  protected mirror: boolean;
  protected radiusScale: number;

  protected gl!: WebGL2RenderingContext;
  private program!: WebGLProgram;
  private texture!: WebGLTexture;
  private vao!: WebGLVertexArrayObject;
  private uPoints!: WebGLUniformLocation;
  private uCount!: WebGLUniformLocation;
  private uTex!: WebGLUniformLocation;
  private uMirror!: WebGLUniformLocation;
  private uAspect!: WebGLUniformLocation;

  protected points = new Float32Array(MAX_POINTS * STRIDE);
  protected activeCount = 0;
  private prev?: Float32Array;

  private landmarker?: FaceLandmarker;
  private rafId = 0;
  private running = false;
  private lastTime = -1;

  constructor(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    o: BaseFilterOptions = {}
  ) {
    this.video = video;
    this.canvas = canvas;
    this.intensity = o.intensity ?? 0.5;
    this.smoothing = o.smoothing ?? 0.4;
    this.mirror = o.mirror ?? true;
    this.radiusScale = o.radiusScale ?? 1.5;
  }

  /* ----- lifecycle ----- */

  async init(): Promise<void> {
    const fileset = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
    );
    this.landmarker = await FaceLandmarker.createFromOptions(fileset, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
        delegate: "GPU",
      },
      runningMode: "VIDEO",
      numFaces: 1,
    });
    this.initGL();
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    const loop = () => {
      if (!this.running) return;
      this.renderFrame();
      this.rafId = requestAnimationFrame(loop);
    };
    this.rafId = requestAnimationFrame(loop);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.rafId);
  }

  setIntensity(v: number): void {
    this.intensity = Math.max(0, Math.min(1, v));
  }

  dispose(): void {
    this.stop();
    this.landmarker?.close();
    if (this.gl) {
      this.gl.deleteProgram(this.program);
      this.gl.deleteTexture(this.texture);
      this.gl.deleteVertexArray(this.vao);
    }
  }

  /* ----- to be implemented by subclasses ----- */

  /** Fill this.points and set this.activeCount from the detected landmarks. */
  protected abstract buildControlPoints(lm: Landmarks): void;

  /**
   * GLSL body that, given:
   *   vec2 uv          - current (mirror-corrected) sample coord
   *   vec2 c           - control point centre
   *   vec2 dir         - control point direction
   *   float rad        - radius
   *   float str        - strength
   *   float uAspect
   * must ADD to `vec2 disp` (the inverse displacement). Default = radial bloat/pinch.
   */
  protected getDisplacementGLSL(): string {
    return `
      vec2 d = uv - c;
      d.x *= uAspect;
      float dist = length(d);
      float t = clamp(1.0 - dist / rad, 0.0, 1.0);
      float falloff = t * t * (3.0 - 2.0 * t);
      disp -= dir * (str * falloff);
    `;
  }

  /* ----- helpers for subclasses ----- */

  protected interocular(lm: Landmarks): number {
    const a = lm[IDX.leftEyeOuter];
    const b = lm[IDX.rightEyeOuter];
    return Math.hypot(b.x - a.x, b.y - a.y) || 0.001;
  }

  protected setPoint(
    i: number,
    cx: number,
    cy: number,
    dirX: number,
    dirY: number,
    radius: number,
    strength: number
  ): void {
    const o = i * STRIDE;
    this.points[o] = cx;
    this.points[o + 1] = cy;
    this.points[o + 2] = dirX;
    this.points[o + 3] = dirY;
    this.points[o + 4] = radius;
    this.points[o + 5] = strength;
  }

  /* ----- internals ----- */

  private renderFrame(): void {
    const { video, canvas, gl } = this;
    if (video.readyState < 2 || !this.landmarker) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }

    let result: FaceLandmarkerResult | undefined;
    if (video.currentTime !== this.lastTime) {
      this.lastTime = video.currentTime;
      result = this.landmarker.detectForVideo(video, performance.now());
    }

    if (result?.faceLandmarks?.length) {
      this.points.fill(0);
      this.activeCount = 0;
      this.buildControlPoints(result.faceLandmarks[0]);
      this.smooth();
    }

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

    gl.viewport(0, 0, w, h);
    gl.useProgram(this.program);
    gl.bindVertexArray(this.vao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.uTex, 0);
    gl.uniform1i(this.uMirror, this.mirror ? 1 : 0);
    gl.uniform1f(this.uAspect, w / h);
    gl.uniform1i(this.uCount, this.activeCount);
    gl.uniform1fv(this.uPoints, this.points);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }

  private smooth(): void {
    if (!this.prev || this.prev.length !== this.points.length) {
      this.prev = this.points.slice();
      return;
    }
    const s = this.smoothing;
    for (let i = 0; i < this.points.length; i++) {
      this.points[i] = this.prev[i] * s + this.points[i] * (1 - s);
    }
    this.prev = this.points.slice();
  }

  private initGL(): void {
    const gl = this.canvas.getContext("webgl2", {
      premultipliedAlpha: false,
      preserveDrawingBuffer: true,
    });
    if (!gl) throw new Error("WebGL2 not supported.");
    this.gl = gl;

    const vs = this.compile(gl.VERTEX_SHADER, VERTEX_SRC);
    const fs = this.compile(gl.FRAGMENT_SHADER, this.buildFragmentSrc());
    const p = gl.createProgram()!;
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) {
      throw new Error("Link failed: " + gl.getProgramInfoLog(p));
    }
    this.program = p;

    const verts = new Float32Array([
      -1, -1, 0, 1, 1, -1, 1, 1, -1, 1, 0, 0, -1, 1, 0, 0, 1, -1, 1, 1, 1, 1,
      1, 0,
    ]);
    const vao = gl.createVertexArray()!;
    gl.bindVertexArray(vao);
    const vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, vbo);
    gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(p, "aPos");
    const aUV = gl.getAttribLocation(p, "aUV");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aUV);
    gl.vertexAttribPointer(aUV, 2, gl.FLOAT, false, 16, 8);
    this.vao = vao;

    this.texture = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    this.uPoints = gl.getUniformLocation(p, "uPoints")!;
    this.uCount = gl.getUniformLocation(p, "uCount")!;
    this.uTex = gl.getUniformLocation(p, "uTex")!;
    this.uMirror = gl.getUniformLocation(p, "uMirror")!;
    this.uAspect = gl.getUniformLocation(p, "uAspect")!;
  }

  private compile(type: number, src: string): WebGLShader {
    const gl = this.gl;
    const sh = gl.createShader(type)!;
    gl.shaderSource(sh, src);
    gl.compileShader(sh);
    if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
      throw new Error("Shader compile failed: " + gl.getShaderInfoLog(sh));
    }
    return sh;
  }

  private buildFragmentSrc(): string {
    return `#version 300 es
precision highp float;
in vec2 vUV;
out vec4 fragColor;
uniform sampler2D uTex;
uniform int uMirror;
uniform float uAspect;
uniform int uCount;
uniform float uPoints[${MAX_POINTS * STRIDE}];

void main() {
  vec2 uv = vUV;
  if (uMirror == 1) uv.x = 1.0 - uv.x;
  vec2 disp = vec2(0.0);
  for (int i = 0; i < ${MAX_POINTS}; i++) {
    if (i >= uCount) break;
    int o = i * ${STRIDE};
    vec2  c   = vec2(uPoints[o + 0], uPoints[o + 1]);
    vec2  dir = vec2(uPoints[o + 2], uPoints[o + 3]);
    float rad = uPoints[o + 4];
    float str = uPoints[o + 5];
    ${this.getDisplacementGLSL()}
  }
  vec2 src = uv + disp;
  fragColor = texture(uTex, src);
}`;
  }
}

const VERTEX_SRC = `#version 300 es
in vec2 aPos;
in vec2 aUV;
out vec2 vUV;
void main() {
  vUV = aUV;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;
