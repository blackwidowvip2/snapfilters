import { DrawCtx } from "./DrawCtx";

/**
 * drawBunny — high-fidelity bunny face filter matching the reference bunny.png.
 *
 * Anchors:
 *   - Ears: rooted in the forehead (landmarks 67/109 left, 297/338 right),
 *     pushed up along the face up-vector by ~0.55 * s.
 *   - Nose: heart-shaped nose centered on landmark 4 (nose tip), slightly raised
 *     so it covers the nostrils naturally.
 *   - Whiskers: 3 per side fanning out from a point ~0.09 * s lateral to the nose.
 *
 * Pure Canvas2D. Drawing order: ears → blush → mouth → whiskers → nose (top).
 */
export function drawBunny(d: DrawCtx) {
  const { ctx, s, angle } = d;

  // Face up-vector (perpendicular to eye line, pointing toward forehead).
  const ux = Math.sin(angle);
  const uy = -Math.cos(angle);
  // Lateral (along eye line, left-to-right in face space).
  const lx = Math.cos(angle);
  const ly = Math.sin(angle);

  const nose = d.pt(4);
  const lForehead = midpoint(d.pt(67), d.pt(109));
  const rForehead = midpoint(d.pt(297), d.pt(338));
  const lCheek = d.pt(234);
  const rCheek = d.pt(454);

  // Lift forehead anchor up along face up-vector to ear base.
  const lift = s * 0.55;
  const lEarBase = { x: lForehead.x + ux * lift, y: lForehead.y + uy * lift };
  const rEarBase = { x: rForehead.x + ux * lift, y: rForehead.y + uy * lift };
  // Pull ear bases slightly inward so they sit on the forehead, not at temples.
  const inset = s * 0.04;
  lEarBase.x += lx * inset; lEarBase.y += ly * inset;
  rEarBase.x -= lx * inset; rEarBase.y -= ly * inset;

  // ── Ears ────────────────────────────────────────────────
  drawEar(d, lEarBase, -1);
  drawEar(d, rEarBase, +1);

  // ── Blush ───────────────────────────────────────────────
  [lCheek, rCheek].forEach((ch) => {
    const g = ctx.createRadialGradient(ch.x, ch.y, 0, ch.x, ch.y, s * 0.18);
    g.addColorStop(0, "rgba(255,130,170,0.28)");
    g.addColorStop(1, "transparent");
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(ch.x, ch.y, s * 0.18, s * 0.1, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── Whiskers (behind nose) ──────────────────────────────
  drawWhiskers(d, nose);

  // ── Mouth (small ω under nose) ──────────────────────────
  drawMouth(d, nose);

  // ── Nose (heart, on top) ────────────────────────────────
  drawHeartNose(d, nose);
}

// ── Helpers ───────────────────────────────────────────────
function midpoint(a: { x: number; y: number }, b: { x: number; y: number }) {
  return { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
}

function drawEar(
  d: DrawCtx,
  base: { x: number; y: number },
  side: -1 | 1,
) {
  const { ctx, s, angle } = d;
  ctx.save();
  ctx.translate(base.x, base.y);
  ctx.rotate(angle + side * 0.12); // slight outward tilt

  const W = s * 0.32;   // ear width
  const H = s * 1.25;   // ear height

  // Soft shadow behind the ear silhouette.
  ctx.shadowColor = "rgba(120,80,120,0.32)";
  ctx.shadowBlur = s * 0.08;
  ctx.shadowOffsetY = s * 0.02;

  // Outer ear (white fur, tear-drop) — quadratic curves for organic shape.
  ctx.beginPath();
  ctx.moveTo(0, 0); // base center
  ctx.quadraticCurveTo(-W * 0.95, -H * 0.45, -W * 0.18, -H * 0.95);
  ctx.quadraticCurveTo(0, -H * 1.05, W * 0.18, -H * 0.95);
  ctx.quadraticCurveTo(W * 0.95, -H * 0.45, 0, 0);
  ctx.closePath();

  const outerGrad = ctx.createLinearGradient(-W, 0, W, 0);
  outerGrad.addColorStop(0, "#FFFFFF");
  outerGrad.addColorStop(0.5, "#FBF6FA");
  outerGrad.addColorStop(1, "#EFE4EE");
  ctx.fillStyle = outerGrad;
  ctx.fill();

  // Reset shadow before stroking / inner detail.
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  ctx.lineWidth = s * 0.012;
  ctx.strokeStyle = "rgba(200,170,200,0.55)";
  ctx.stroke();

  // Inner pink (smaller tear-drop, centered slightly forward).
  const iw = W * 0.52;
  const ih = H * 0.78;
  const iy = -H * 0.08; // pushed up into the ear
  ctx.beginPath();
  ctx.moveTo(0, iy);
  ctx.quadraticCurveTo(-iw * 0.95, iy - ih * 0.45, -iw * 0.16, iy - ih * 0.92);
  ctx.quadraticCurveTo(0, iy - ih * 1.0, iw * 0.16, iy - ih * 0.92);
  ctx.quadraticCurveTo(iw * 0.95, iy - ih * 0.45, 0, iy);
  ctx.closePath();

  const innerGrad = ctx.createRadialGradient(0, iy - ih * 0.5, 0, 0, iy - ih * 0.3, ih * 0.9);
  innerGrad.addColorStop(0, "#FFD0E0");
  innerGrad.addColorStop(0.55, "#FF95B8");
  innerGrad.addColorStop(1, "#E26A95");
  ctx.fillStyle = innerGrad;
  ctx.fill();

  // Glossy highlight along upper-left inner edge.
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = s * 0.008;
  ctx.beginPath();
  ctx.moveTo(-iw * 0.35, iy - ih * 0.25);
  ctx.quadraticCurveTo(-iw * 0.5, iy - ih * 0.6, -iw * 0.1, iy - ih * 0.85);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawHeartNose(d: DrawCtx, nose: { x: number; y: number }) {
  const { ctx, s, angle } = d;
  ctx.save();
  ctx.translate(nose.x, nose.y - s * 0.02);
  ctx.rotate(angle);

  const w = s * 0.13;       // heart half-width
  const h = s * 0.13;       // heart total height

  // Heart path: two top lobes + bezier down to a point.
  ctx.beginPath();
  ctx.moveTo(0, -h * 0.15);
  // Left lobe
  ctx.bezierCurveTo(-w * 0.55, -h * 0.85, -w * 1.1, -h * 0.2, 0, h * 0.55);
  // Right lobe (mirror)
  ctx.moveTo(0, -h * 0.15);
  ctx.bezierCurveTo(w * 0.55, -h * 0.85, w * 1.1, -h * 0.2, 0, h * 0.55);
  ctx.closePath();

  // Soft shadow under the nose.
  ctx.shadowColor = "rgba(180,60,110,0.35)";
  ctx.shadowBlur = s * 0.04;
  ctx.shadowOffsetY = s * 0.012;

  const grad = ctx.createRadialGradient(-w * 0.2, -h * 0.3, 0, 0, 0, w);
  grad.addColorStop(0, "#FFB2CF");
  grad.addColorStop(0.55, "#FF7BA8");
  grad.addColorStop(1, "#E04F84");
  ctx.fillStyle = grad;
  ctx.fill();

  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;

  // White highlight on upper-left lobe.
  ctx.fillStyle = "rgba(255,255,255,0.6)";
  ctx.beginPath();
  ctx.ellipse(-w * 0.35, -h * 0.4, w * 0.18, h * 0.1, -0.5, 0, Math.PI * 2);
  ctx.fill();

  // Small secondary highlight on right lobe.
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.beginPath();
  ctx.ellipse(w * 0.3, -h * 0.32, w * 0.08, h * 0.05, -0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawMouth(d: DrawCtx, nose: { x: number; y: number }) {
  const { ctx, s, angle } = d;
  ctx.save();
  ctx.translate(nose.x, nose.y + s * 0.08);
  ctx.rotate(angle);

  ctx.strokeStyle = "#C8527F";
  ctx.lineWidth = s * 0.014;
  ctx.lineCap = "round";
  // Vertical line from nose down to mouth.
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.06);
  ctx.lineTo(0, s * 0.005);
  ctx.stroke();

  // Two small arcs forming an ω.
  const r = s * 0.045;
  ctx.beginPath();
  ctx.arc(-r * 0.9, s * 0.01, r, 0, Math.PI, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(r * 0.9, s * 0.01, r, 0, Math.PI, false);
  ctx.stroke();

  ctx.restore();
}

function drawWhiskers(d: DrawCtx, nose: { x: number; y: number }) {
  const { ctx, s, angle } = d;
  const baseOffset = s * 0.09;
  const len = s * 0.55;

  ([-1, 1] as const).forEach((side) => {
    ctx.save();
    ctx.translate(nose.x + Math.cos(angle) * baseOffset * side, nose.y + Math.sin(angle) * baseOffset * side);
    ctx.rotate(angle);

    [-0.22, 0, 0.22].forEach((tilt) => {
      ctx.save();
      ctx.rotate(tilt * side);
      // Whisker line.
      ctx.strokeStyle = "rgba(60,55,70,0.78)";
      ctx.lineWidth = Math.max(1, s * 0.008);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(side * len, 0);
      ctx.stroke();

      // 4 dots along whisker (reference detail).
      ctx.fillStyle = "rgba(40,35,55,0.85)";
      for (let k = 1; k <= 4; k++) {
        const t = k / 5;
        ctx.beginPath();
        ctx.arc(side * len * t, 0, s * 0.0065, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });

    ctx.restore();
  });
}
