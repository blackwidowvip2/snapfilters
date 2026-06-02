/**
 * batCowlMaskFilter.ts
 * ------------------------------------------------------------------------------------------------
 * A real-time face filter that replaces everything EXCEPT the area around the person's eyes with a
 * professionally hand-drawn, bat-inspired hero cowl (mask). The person's own eyes show through two
 * sculpted eye openings; the cowl follows the head's position, scale, and roll in real time.
 *
 * Design note
 * -----------
 * The cowl is an ORIGINAL vector design rendered procedurally on a 2D canvas — sculpted forehead
 * ridges, a pronounced brow, two upright pointed ears, a tapered nose bridge, cheek planes with
 * subtle specular highlights, and matte-rubber shading via layered radial/linear gradients. It is
 * not a reproduction of any specific copyrighted artwork.
 *
 * Pipeline
 * --------
 *  1. MediaPipe Face Landmarker (468 pts) gives us a stable eye line, face width, and roll angle.
 *  2. We compute a head-space transform (centre, scale = inter-ocular distance, rotation = eye-line
 *     roll) and draw the cowl into that transform.
 *  3. Two eye holes are punched out (destination-out) over the real eyes so the user's eyes remain
 *     fully visible and aligned, with a soft feathered edge for a natural seated look.
 *  4. Everything composites over the live video each frame.
 *
 * Dependency:  npm i @mediapipe/tasks-vision
 *
 * Usage:
 *   const f = new BatCowlMaskFilter(video, canvas, { mirror: true });
 *   await f.init();
 *   f.start();
 * ------------------------------------------------------------------------------------------------
 */

import {
  FaceLandmarker,
  FilesetResolver,
  type FaceLandmarkerResult,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";

export interface BatCowlMaskOptions {
  /** Selfie mirror. Default true. */
  mirror?: boolean;
  /** Temporal smoothing of the head transform, 0..1. Default 0.5. */
  smoothing?: number;
  /** Overall mask scale multiplier (fit tuning). Default 1.0. */
  scale?: number;
  /** Cowl base colour. Default near-black charcoal. */
  color?: string;
}

type Pt = { x: number; y: number };

const IDX = {
  leftEyeOuter: 33,
  rightEyeOuter: 263,
  leftEyeInner: 133,
  rightEyeInner: 362,
  leftEyeCenterTop: 159,
  leftEyeCenterBottom: 145,
  rightEyeCenterTop: 386,
  rightEyeCenterBottom: 374,
  noseTip: 1,
  noseBridge: 168,
  chin: 152,
  forehead: 10,
  faceLeft: 234,
  faceRight: 454,
} as const;

export class BatCowlMaskFilter {
  private readonly video: HTMLVideoElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly mirror: boolean;
  private readonly smoothing: number;
  private readonly userScale: number;
  private readonly color: string;

  /** Offscreen canvas where the cowl is drawn once per frame in head-space. */
  private readonly cowl: HTMLCanvasElement;
  private readonly cowlCtx: CanvasRenderingContext2D;

  private landmarker?: FaceLandmarker;
  private rafId = 0;
  private running = false;
  private lastTime = -1;

  // smoothed head transform
  private s = { cx: 0, cy: 0, scale: 0, angle: 0, ready: false };

  constructor(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    o: BatCowlMaskOptions = {}
  ) {
    this.video = video;
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D context unavailable.");
    this.ctx = ctx;
    this.mirror = o.mirror ?? true;
    this.smoothing = o.smoothing ?? 0.5;
    this.userScale = o.scale ?? 1.0;
    this.color = o.color ?? "#15171c";

    this.cowl = document.createElement("canvas");
    const cc = this.cowl.getContext("2d");
    if (!cc) throw new Error("2D context unavailable (offscreen).");
    this.cowlCtx = cc;
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

  dispose(): void {
    this.stop();
    this.landmarker?.close();
  }

  /* ----- per-frame ----- */

  private renderFrame(): void {
    const { video, canvas, ctx } = this;
    if (video.readyState < 2 || !this.landmarker) return;

    const w = video.videoWidth;
    const h = video.videoHeight;
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
      this.cowl.width = w;
      this.cowl.height = h;
    }

    let result: FaceLandmarkerResult | undefined;
    if (video.currentTime !== this.lastTime) {
      this.lastTime = video.currentTime;
      result = this.landmarker.detectForVideo(video, performance.now());
    }

    // 1) draw the live video (mirrored if requested)
    ctx.save();
    ctx.clearRect(0, 0, w, h);
    if (this.mirror) {
      ctx.translate(w, 0);
      ctx.scale(-1, 1);
    }
    ctx.drawImage(video, 0, 0, w, h);
    ctx.restore();

    if (result?.faceLandmarks?.length) {
      const lm = result.faceLandmarks[0];
      this.updateTransform(lm, w, h);
      this.drawCowl(lm, w, h);
      // composite the cowl (already in screen space) over the video
      ctx.drawImage(this.cowl, 0, 0);
    }
  }

  /** Convert a normalized landmark to screen pixels, respecting mirror. */
  private px(p: NormalizedLandmark, w: number, h: number): Pt {
    const x = this.mirror ? (1 - p.x) * w : p.x * w;
    return { x, y: p.y * h };
  }

  private updateTransform(
    lm: NormalizedLandmark[],
    w: number,
    h: number
  ): void {
    const le = this.px(lm[IDX.leftEyeOuter], w, h);
    const re = this.px(lm[IDX.rightEyeOuter], w, h);
    const bridge = this.px(lm[IDX.noseBridge], w, h);

    const dx = re.x - le.x;
    const dy = re.y - le.y;
    const dist = Math.hypot(dx, dy) || 1;
    const angle = Math.atan2(dy, dx);

    // centre the cowl around the brow/bridge area
    const cx = bridge.x;
    const cy = bridge.y;
    const scale = dist * this.userScale;

    if (!this.s.ready) {
      this.s = { cx, cy, scale, angle, ready: true };
    } else {
      const a = this.smoothing;
      this.s.cx = this.s.cx * a + cx * (1 - a);
      this.s.cy = this.s.cy * a + cy * (1 - a);
      this.s.scale = this.s.scale * a + scale * (1 - a);
      // angle: lerp on shortest path
      let diff = angle - this.s.angle;
      while (diff > Math.PI) diff -= 2 * Math.PI;
      while (diff < -Math.PI) diff += 2 * Math.PI;
      this.s.angle += diff * (1 - a);
    }
  }

  /* --------------------------------------------------------------------------------------------
   * The cowl artwork
   * ------------------------------------------------------------------------------------------
   * Drawn in a normalized unit space where 1.0 == inter-ocular distance, origin at the nose
   * bridge, +x toward the right eye, +y downward. The head transform maps it to the screen.
   * All coordinates below are expressed in these units, so the mask auto-fits any face.
   */
  private drawCowl(lm: NormalizedLandmark[], w: number, h: number): void {
    const c = this.cowlCtx;
    c.clearRect(0, 0, w, h);

    c.save();
    c.translate(this.s.cx, this.s.cy);
    c.rotate(this.s.angle);
    c.scale(this.s.scale, this.s.scale);

    // -------- silhouette path (one continuous cowl outline) --------
    // Units: eye distance = 1. Face spans roughly x ∈ [-1.5, 1.5].
    const cowlPath = new Path2D();
    // Start at chin
    cowlPath.moveTo(0, 2.55);
    // right jaw up to cheek
    cowlPath.bezierCurveTo(0.9, 2.5, 1.5, 1.9, 1.62, 1.15);
    // right cheek to temple
    cowlPath.bezierCurveTo(1.72, 0.55, 1.7, 0.15, 1.55, -0.35);
    // right ear base
    cowlPath.lineTo(1.42, -0.95);
    // RIGHT EAR (pointed, upright, slightly outward)
    cowlPath.lineTo(1.72, -2.75);
    cowlPath.lineTo(1.05, -1.35);
    // brow valley between ears (the classic dip over the forehead)
    cowlPath.bezierCurveTo(0.7, -1.7, 0.32, -1.85, 0, -1.86);
    cowlPath.bezierCurveTo(-0.32, -1.85, -0.7, -1.7, -1.05, -1.35);
    // LEFT EAR
    cowlPath.lineTo(-1.72, -2.75);
    cowlPath.lineTo(-1.42, -0.95);
    // left temple down
    cowlPath.lineTo(-1.55, -0.35);
    cowlPath.bezierCurveTo(-1.7, 0.15, -1.72, 0.55, -1.62, 1.15);
    // left cheek to jaw
    cowlPath.bezierCurveTo(-1.5, 1.9, -0.9, 2.5, 0, 2.55);
    cowlPath.closePath();

    // -------- base fill with sculpted shading --------
    const base = c.createLinearGradient(0, -2.8, 0, 2.6);
    base.addColorStop(0, this.shade(this.color, 1.25));
    base.addColorStop(0.45, this.color);
    base.addColorStop(1, this.shade(this.color, 0.72));
    c.fillStyle = base;
    c.fill(cowlPath);

    // soft ambient occlusion at the cowl edge for depth
    c.save();
    c.clip(cowlPath);

    // forehead dome highlight
    this.radial(c, 0, -1.1, 1.4, [
      [0, this.shade(this.color, 1.5) + "cc"],
      [1, "transparent"],
    ]);
    // left/right cheek planes (subtle specular)
    this.radial(c, 1.05, 0.9, 0.95, [
      [0, this.shade(this.color, 1.35) + "aa"],
      [1, "transparent"],
    ]);
    this.radial(c, -1.05, 0.9, 0.95, [
      [0, this.shade(this.color, 1.35) + "aa"],
      [1, "transparent"],
    ]);
    // shadow under brow ridge
    this.radial(c, 0, -0.05, 1.3, [
      [0, this.shade(this.color, 0.45) + "cc"],
      [0.7, "transparent"],
      [1, "transparent"],
    ]);
    // nose bridge ridge (vertical highlight)
    const ridge = c.createLinearGradient(-0.18, 0, 0.18, 0);
    ridge.addColorStop(0, "transparent");
    ridge.addColorStop(0.5, this.shade(this.color, 1.55) + "88");
    ridge.addColorStop(1, "transparent");
    c.fillStyle = ridge;
    c.fillRect(-0.25, -0.2, 0.5, 1.6);
    c.restore();

    // -------- sculpted brow ridge (raised) --------
    c.lineJoin = "round";
    c.strokeStyle = this.shade(this.color, 0.55);
    c.lineWidth = 0.06;
    const brow = new Path2D();
    brow.moveTo(-1.25, 0.05);
    brow.bezierCurveTo(-0.85, -0.32, -0.5, -0.36, -0.32, -0.18);
    brow.lineTo(-0.18, 0.35); // inner brow down toward nose
    brow.moveTo(1.25, 0.05);
    brow.bezierCurveTo(0.85, -0.32, 0.5, -0.36, 0.32, -0.18);
    brow.lineTo(0.18, 0.35);
    c.stroke(brow);

    // brow highlight on the upper edge
    c.strokeStyle = this.shade(this.color, 1.45) + "99";
    c.lineWidth = 0.03;
    c.stroke(brow);

    // -------- ear inner shadow (depth) --------
    c.fillStyle = this.shade(this.color, 0.5);
    const earR = new Path2D();
    earR.moveTo(1.18, -1.2);
    earR.lineTo(1.62, -2.55);
    earR.lineTo(1.2, -1.55);
    earR.closePath();
    c.fill(earR);
    const earL = new Path2D();
    earL.moveTo(-1.18, -1.2);
    earL.lineTo(-1.62, -2.55);
    earL.lineTo(-1.2, -1.55);
    earL.closePath();
    c.fill(earL);

    // -------- crisp outline + rim light --------
    c.strokeStyle = this.shade(this.color, 0.35);
    c.lineWidth = 0.05;
    c.stroke(cowlPath);

    // -------- punch out the eye openings (reveal real eyes) --------
    // Eye openings are angular/almond, slightly larger than the eyes, with feathered edges.
    this.cutEye(c, lm, w, h, "left");
    this.cutEye(c, lm, w, h, "right");

    c.restore();
  }

  /**
   * Cut an almond-shaped opening over one eye using destination-out, so the underlying video eye
   * shows through. Computed from the actual eye landmarks for a precise fit, then transformed into
   * the cowl's local space.
   */
  private cutEye(
    c: CanvasRenderingContext2D,
    lm: NormalizedLandmark[],
    w: number,
    h: number,
    side: "left" | "right"
  ): void {
    const outerI = side === "left" ? IDX.leftEyeOuter : IDX.rightEyeOuter;
    const innerI = side === "left" ? IDX.leftEyeInner : IDX.rightEyeInner;
    const topI = side === "left" ? IDX.leftEyeCenterTop : IDX.rightEyeCenterTop;
    const botI =
      side === "left" ? IDX.leftEyeCenterBottom : IDX.rightEyeCenterBottom;

    // screen-space eye points
    const outer = this.px(lm[outerI], w, h);
    const inner = this.px(lm[innerI], w, h);
    const top = this.px(lm[topI], w, h);
    const bot = this.px(lm[botI], w, h);

    // convert each into cowl-local units (inverse of the current transform)
    const toLocal = (p: Pt): Pt => {
      const tx = p.x - this.s.cx;
      const ty = p.y - this.s.cy;
      const ca = Math.cos(-this.s.angle);
      const sa = Math.sin(-this.s.angle);
      return {
        x: (tx * ca - ty * sa) / this.s.scale,
        y: (tx * sa + ty * ca) / this.s.scale,
      };
    };
    const O = toLocal(outer);
    const I = toLocal(inner);
    const T = toLocal(top);
    const B = toLocal(bot);

    const cx = (O.x + I.x) / 2;
    const cy = (T.y + B.y) / 2;
    const halfW = (Math.abs(O.x - I.x) / 2) * 1.45 + 0.12;
    const halfH = (Math.abs(B.y - T.y) / 2) * 2.2 + 0.18;

    // feathered cut: soft radial alpha so the rubber edge meets skin smoothly
    c.save();
    c.globalCompositeOperation = "destination-out";
    const grad = c.createRadialGradient(cx, cy, 0, cx, cy, Math.max(halfW, halfH));
    grad.addColorStop(0, "rgba(0,0,0,1)");
    grad.addColorStop(0.72, "rgba(0,0,0,1)");
    grad.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = grad;

    // almond shape
    c.beginPath();
    c.moveTo(cx - halfW, cy);
    c.bezierCurveTo(
      cx - halfW * 0.5,
      cy - halfH,
      cx + halfW * 0.5,
      cy - halfH,
      cx + halfW,
      cy
    );
    c.bezierCurveTo(
      cx + halfW * 0.5,
      cy + halfH,
      cx - halfW * 0.5,
      cy + halfH,
      cx - halfW,
      cy
    );
    c.closePath();
    c.fill();
    c.restore();

    // dark sculpted rim around the opening (eye socket depth)
    c.save();
    c.strokeStyle = this.shade(this.color, 0.4) + "cc";
    c.lineWidth = 0.05;
    c.beginPath();
    c.moveTo(cx - halfW, cy);
    c.bezierCurveTo(
      cx - halfW * 0.5,
      cy - halfH,
      cx + halfW * 0.5,
      cy - halfH,
      cx + halfW,
      cy
    );
    c.bezierCurveTo(
      cx + halfW * 0.5,
      cy + halfH,
      cx - halfW * 0.5,
      cy + halfH,
      cx - halfW,
      cy
    );
    c.closePath();
    c.stroke();
    c.restore();
  }

  /* ----- small drawing helpers ----- */

  private radial(
    c: CanvasRenderingContext2D,
    x: number,
    y: number,
    r: number,
    stops: [number, string][]
  ): void {
    const g = c.createRadialGradient(x, y, 0, x, y, r);
    for (const [o, col] of stops) g.addColorStop(o, col);
    c.fillStyle = g;
    c.fillRect(x - r, y - r, r * 2, r * 2);
  }

  /** Lighten (>1) or darken (<1) a hex colour, returns #rrggbb. */
  private shade(hex: string, mul: number): string {
    const m = hex.replace("#", "");
    const n = parseInt(
      m.length === 3
        ? m
            .split("")
            .map((x) => x + x)
            .join("")
        : m,
      16
    );
    let r = (n >> 16) & 255;
    let g = (n >> 8) & 255;
    let b = n & 255;
    r = Math.max(0, Math.min(255, Math.round(r * mul)));
    g = Math.max(0, Math.min(255, Math.round(g * mul)));
    b = Math.max(0, Math.min(255, Math.round(b * mul)));
    return "#" + ((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1);
  }
}

export default BatCowlMaskFilter;
