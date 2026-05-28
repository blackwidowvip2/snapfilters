import { DrawCtx } from '../DrawCtx';

export function drawBunny(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose = d.pt(4);
  const lBrow = d.pt(70), rBrow = d.pt(300);
  const lCheek = d.pt(234), rCheek = d.pt(454);

  // ── Tall ears ──────────────────────────────────────────
  [{ brow: lBrow, side: -1 }, { brow: rBrow, side: 1 }].forEach(({ brow, side }) => {
    ctx.save();
    ctx.translate(brow.x + side * s * 0.02, brow.y - s * 0.06);
    ctx.rotate(angle + side * 0.08);

    // Outer ear (white/cream)
    const earGrad = ctx.createLinearGradient(-s * 0.12, -s * 0.78, s * 0.12, 0);
    earGrad.addColorStop(0, '#F5E6F0');
    earGrad.addColorStop(1, '#EDD8E8');
    ctx.fillStyle = earGrad;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.42, s * 0.13, s * 0.46, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#D8C0D8';
    ctx.lineWidth = s * 0.018;
    ctx.stroke();

    // Inner ear (pink)
    const innerGrad = ctx.createLinearGradient(0, -s * 0.72, 0, -s * 0.06);
    innerGrad.addColorStop(0, '#FFB6D9');
    innerGrad.addColorStop(1, '#FF80B8');
    ctx.fillStyle = innerGrad;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.42, s * 0.072, s * 0.36, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── Round nose ─────────────────────────────────────────
  ctx.save();
  ctx.translate(nose.x, nose.y);
  ctx.rotate(angle);
  const noseGrad = ctx.createRadialGradient(-s * 0.012, -s * 0.012, 0, 0, 0, s * 0.065);
  noseGrad.addColorStop(0, '#FF8EC0');
  noseGrad.addColorStop(1, '#FF5599');
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.arc(0, 0, s * 0.065, 0, Math.PI * 2);
  ctx.fill();
  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.38)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.022, -s * 0.02, s * 0.022, s * 0.014, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Whiskers ───────────────────────────────────────────
  [{ side: -1, ox: -s * 0.04 }, { side: 1, ox: s * 0.04 }].forEach(({ side, ox }) => {
    for (let j = -1; j <= 1; j++) {
      ctx.save();
      ctx.translate(nose.x + ox, nose.y);
      ctx.rotate(angle + j * 0.18 * side);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(side * s * 0.5, j * s * 0.044);
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
  });

  // ── Rosy cheeks ────────────────────────────────────────
  [lCheek, rCheek].forEach(ch => {
    const g = ctx.createRadialGradient(ch.x, ch.y, 0, ch.x, ch.y, s * 0.17);
    g.addColorStop(0, 'rgba(255,120,160,0.45)');
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(ch.x, ch.y, s * 0.17, s * 0.09, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
