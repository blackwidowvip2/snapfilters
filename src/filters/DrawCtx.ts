import type { LandmarkList } from '../types';

export class DrawCtx {
  ctx: CanvasRenderingContext2D;
  lm: LandmarkList;
  W: number;
  H: number;
  t: number;   // time in seconds
  s: number;   // face scale (inter-ocular distance in px)
  angle: number;

  constructor(
    ctx: CanvasRenderingContext2D,
    lm: LandmarkList,
    W: number,
    H: number,
    t: number,
  ) {
    this.ctx = ctx;
    this.lm = lm;
    this.W = W;
    this.H = H;
    this.t = t;
    this.s = this.faceScale();
    this.angle = this.faceAngle();
  }

  // ── Landmark helpers ──────────────────────────────────
  pt(idx: number) {
    const p = this.lm[idx];
    if (!p) return { x: 0, y: 0, z: 0 };
    return { x: p.x * this.W, y: p.y * this.H, z: p.z ?? 0 };
  }

  eyeCenter(side: 'left' | 'right') {
    if (side === 'left') {
      const o = this.pt(33), i = this.pt(133);
      return { x: (o.x + i.x) / 2, y: (o.y + i.y) / 2 };
    }
    const o = this.pt(263), i = this.pt(362);
    return { x: (o.x + i.x) / 2, y: (o.y + i.y) / 2 };
  }

  mouthCenter() {
    const l = this.pt(61), r = this.pt(291);
    return { x: (l.x + r.x) / 2, y: (l.y + r.y) / 2 };
  }

  faceScale() {
    const l = this.pt(33), r = this.pt(263);
    return Math.max(10, Math.hypot(r.x - l.x, r.y - l.y));
  }

  faceAngle() {
    const l = this.pt(33), r = this.pt(263);
    return Math.atan2(r.y - l.y, r.x - l.x);
  }

  // ── Drawing helpers ───────────────────────────────────
  oval(
    x: number, y: number,
    rx: number, ry: number,
    color: string,
    alpha = 1,
    rot = 0,
  ) {
    const { ctx } = this;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rot);
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.ellipse(0, 0, Math.max(1, rx), Math.max(1, ry), 0, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
  }

  /** Draw lips using all FaceMesh lip landmark indices */
  drawLipShape(color: string, alpha = 0.82, gloss = true) {
    const { ctx } = this;
    const outerUpper = [61,185,40,39,37,0,267,269,270,409,291];
    const outerLower = [291,375,321,405,314,17,84,181,91,146,61];

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.shadowColor = color;
    ctx.shadowBlur = 3;

    ctx.beginPath();
    const p0 = this.pt(outerUpper[0]);
    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i < outerUpper.length; i++) {
      const p = this.pt(outerUpper[i]);
      ctx.lineTo(p.x, p.y);
    }
    for (let i = 1; i < outerLower.length; i++) {
      const p = this.pt(outerLower[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.closePath();
    ctx.fill();

    if (gloss) {
      const mc = this.mouthCenter();
      const s = this.s;
      // Cupid's bow highlight
      const gls = ctx.createRadialGradient(mc.x, mc.y - s * 0.06, 0, mc.x, mc.y - s * 0.04, s * 0.1);
      gls.addColorStop(0, 'rgba(255,255,255,0.38)');
      gls.addColorStop(1, 'transparent');
      ctx.globalAlpha = 0.6;
      ctx.fillStyle = gls;
      ctx.beginPath();
      ctx.ellipse(mc.x, mc.y - s * 0.04, s * 0.11, s * 0.03, this.angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** Draw eye lashes on upper lid */
  drawLashes(eye: { x: number; y: number }, side: -1 | 1, color = '#000', length = 1) {
    const { ctx } = this;
    const s = this.s;
    ctx.save();
    ctx.translate(eye.x, eye.y);
    ctx.rotate(this.angle);
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.013;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#000';
    ctx.shadowBlur = 4;
    for (let k = -5; k <= 5; k++) {
      const bx = k * s * 0.022;
      const by = -s * 0.085;
      const angle = (k / 5) * 0.35 * side;
      ctx.beginPath();
      ctx.moveTo(bx, by);
      ctx.lineTo(bx + Math.sin(angle) * s * 0.055 * length, by - Math.cos(angle) * s * 0.055 * length);
      ctx.stroke();
    }
    ctx.restore();
  }

  /** Draw eyebrow */
  drawBrow(pts: number[], color: string, thickness: number) {
    const { ctx } = this;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = thickness;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    const start = this.pt(pts[0]);
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < pts.length; i++) {
      const p = this.pt(pts[i]);
      ctx.lineTo(p.x, p.y);
    }
    ctx.stroke();
    ctx.restore();
  }

  /** Simple pseudo-random from index */
  pseudo(n: number) {
    const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
    return x - Math.floor(x);
  }
}
