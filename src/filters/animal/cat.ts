import { DrawCtx } from '../DrawCtx';

export function drawCat(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose = d.pt(4);
  const lBrow = d.pt(70), rBrow = d.pt(300);
  const lCheek = d.pt(234), rCheek = d.pt(454);

  // ── Ears ───────────────────────────────────────────────
  [{ brow: lBrow, side: -1 }, { brow: rBrow, side: 1 }].forEach(({ brow, side }) => {
    ctx.save();
    ctx.translate(brow.x + side * s * 0.05, brow.y - s * 0.08);
    ctx.rotate(angle + side * 0.12);

    // Outer ear
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.34);
    ctx.lineTo(-side * s * 0.19, s * 0.07);
    ctx.lineTo(side * s * 0.19, s * 0.07);
    ctx.closePath();
    ctx.fillStyle = '#C0A0C0';
    ctx.fill();
    ctx.strokeStyle = '#9070A0';
    ctx.lineWidth = s * 0.015;
    ctx.stroke();

    // Inner ear
    ctx.beginPath();
    ctx.moveTo(0, -s * 0.24);
    ctx.lineTo(-side * s * 0.1, s * 0.04);
    ctx.lineTo(side * s * 0.1, s * 0.04);
    ctx.closePath();
    const innerGrad = ctx.createLinearGradient(0, -s * 0.24, 0, s * 0.04);
    innerGrad.addColorStop(0, '#FF90C0');
    innerGrad.addColorStop(1, '#FFB6D9');
    ctx.fillStyle = innerGrad;
    ctx.fill();
    ctx.restore();
  });

  // ── Pink nose ──────────────────────────────────────────
  ctx.save();
  ctx.translate(nose.x, nose.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.04);
  ctx.lineTo(-s * 0.055, s * 0.03);
  ctx.lineTo(s * 0.055, s * 0.03);
  ctx.closePath();
  const noseGrad = ctx.createLinearGradient(0, -s * 0.04, 0, s * 0.03);
  noseGrad.addColorStop(0, '#FF8EC0');
  noseGrad.addColorStop(1, '#FF5599');
  ctx.fillStyle = noseGrad;
  ctx.fill();
  ctx.restore();

  // ── Whiskers ───────────────────────────────────────────
  [{ side: -1, ox: -s * 0.04 }, { side: 1, ox: s * 0.04 }].forEach(({ side, ox }) => {
    for (let j = -1; j <= 1; j++) {
      ctx.save();
      ctx.translate(nose.x + ox, nose.y);
      ctx.rotate(angle + j * 0.22 * side);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(side * s * 0.54, j * s * 0.055);
      ctx.strokeStyle = 'rgba(255,255,255,0.88)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
  });

  // ── Slit pupils ────────────────────────────────────────
  ['left' as const, 'right' as const].forEach(side => {
    const eye = d.eyeCenter(side);
    ctx.save();
    ctx.translate(eye.x, eye.y);
    ctx.rotate(angle);

    // Iris
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.068, s * 0.068, 0, 0, Math.PI * 2);
    const irisGrad = ctx.createRadialGradient(-s * 0.01, -s * 0.01, 0, 0, 0, s * 0.068);
    irisGrad.addColorStop(0, '#7AE87A');
    irisGrad.addColorStop(1, '#3A8A3A');
    ctx.fillStyle = irisGrad;
    ctx.fill();

    // Pupil (vertical slit)
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.022, s * 0.088, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.85)';
    ctx.fill();

    // Shine
    ctx.fillStyle = 'rgba(255,255,255,0.45)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.02, -s * 0.024, s * 0.014, s * 0.01, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── Blush ──────────────────────────────────────────────
  [lCheek, rCheek].forEach(ch => {
    const g = ctx.createRadialGradient(ch.x, ch.y, 0, ch.x, ch.y, s * 0.15);
    g.addColorStop(0, 'rgba(255,140,160,0.42)');
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(ch.x, ch.y, s * 0.15, s * 0.08, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
