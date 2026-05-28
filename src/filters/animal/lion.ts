import { DrawCtx } from '../DrawCtx';

export function drawLion(d: DrawCtx) {
  const { ctx, s, angle, t } = d;
  const fh = d.pt(10);
  const nose = d.pt(4);
  const lBrow = d.pt(70), rBrow = d.pt(300);
  
  const lCheek = d.pt(234), rCheek = d.pt(454);

  // ── Animated mane (drawn first, behind everything) ─────
  const maneCenter = { x: fh.x, y: fh.y + s * 0.2 };
  const maneColors = ['#C47800','#E09020','#A05C00','#D08010','#B86800','#F0A030'];

  ctx.save();
  ctx.translate(maneCenter.x, maneCenter.y);
  ctx.rotate(angle);
  for (let k = 0; k < 16; k++) {
    const baseAngle = (k / 16) * Math.PI * 2;
    const breathe = Math.sin(t * 1.2 + k * 0.7) * 0.06;
    const r = s * (0.76 + breathe);
    const ox = Math.cos(baseAngle) * r;
    const oy = Math.sin(baseAngle) * r;
    const tuftW = s * (0.15 + d.pseudo(k * 2.1) * 0.06);
    const tuftH = s * (0.24 + d.pseudo(k * 3.7) * 0.08);
    ctx.fillStyle = maneColors[k % maneColors.length];
    ctx.globalAlpha = 0.72 + Math.sin(t * 2 + k) * 0.12;
    ctx.beginPath();
    ctx.ellipse(ox, oy, tuftW, tuftH, baseAngle + Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;
  ctx.restore();

  // ── Ears ───────────────────────────────────────────────
  [{ brow: lBrow, side: -1 }, { brow: rBrow, side: 1 }].forEach(({ brow, side }) => {
    ctx.save();
    ctx.translate(brow.x + side * s * 0.06, brow.y - s * 0.08);
    ctx.rotate(angle + side * 0.1);
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = '#C47800';
    ctx.fill();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.08, 0, Math.PI * 2);
    ctx.fillStyle = '#F5C060';
    ctx.fill();
    ctx.restore();
  });

  // ── Wide nose ──────────────────────────────────────────
  ctx.save();
  ctx.translate(nose.x, nose.y);
  ctx.rotate(angle);
  const ng = ctx.createRadialGradient(-s * 0.02, -s * 0.02, 0, 0, 0, s * 0.11);
  ng.addColorStop(0, '#1a0a00');
  ng.addColorStop(1, '#0d0500');
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.1, s * 0.072, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.2)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.028, -s * 0.02, s * 0.028, s * 0.016, -0.4, 0, Math.PI * 2);
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
      ctx.lineTo(side * s * 0.62, j * s * 0.06);
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
  });

  // ── Cheek markings ─────────────────────────────────────
  [lCheek, rCheek].forEach((ch, ci) => {
    const side = ci === 0 ? -1 : 1;
    ctx.save();
    ctx.translate(ch.x, ch.y);
    ctx.rotate(angle);
    ctx.globalAlpha = 0.35;
    for (let k = 0; k < 3; k++) {
      ctx.beginPath();
      ctx.moveTo(side * (s * 0.05 + k * s * 0.09), -s * 0.1);
      ctx.lineTo(side * (s * 0.09 + k * s * 0.09), s * 0.1);
      ctx.strokeStyle = '#1a1a1a';
      ctx.lineWidth = s * 0.048;
      ctx.lineCap = 'round';
      ctx.stroke();
    }
    ctx.restore();
  });
}
