import { DrawCtx } from '../DrawCtx';

export function drawLion(d: DrawCtx) {
  const { ctx, s, angle, t } = d;
  const fh     = d.pt(10);
  const nose   = d.pt(4);
  const lBrow  = d.pt(70);
  const rBrow  = d.pt(300);
  const lCheek = d.pt(234);
  const rCheek = d.pt(454);

  // ── Animated mane (drawn first — behind face) ─────────
  const maneC = { x: fh.x, y: fh.y + s*0.2 };
  const maneColors = ['#C47800','#E09020','#A05C00','#D08010','#B86800','#F0A030'];
  ctx.save();
  ctx.translate(maneC.x, maneC.y); ctx.rotate(angle);
  for (let k = 0; k < 16; k++) {
    const ba = (k/16)*Math.PI*2;
    const r  = s*(0.8 + Math.sin(t*1.2 + k*0.7)*0.07);
    const ox = Math.cos(ba)*r, oy = Math.sin(ba)*r;
    ctx.fillStyle = maneColors[k%maneColors.length];
    ctx.globalAlpha = 0.72 + Math.sin(t*2+k)*0.12;
    ctx.beginPath(); ctx.ellipse(ox, oy, s*0.16, s*0.26, ba+Math.PI/2, 0, Math.PI*2); ctx.fill();
  }
  ctx.globalAlpha = 1; ctx.restore();

  // ── Ears ──────────────────────────────────────────────
  [{ brow: lBrow, side: -1 }, { brow: rBrow, side: 1 }].forEach(({ brow, side }) => {
    ctx.save();
    ctx.translate(brow.x + side*s*0.06, brow.y - s*0.08); ctx.rotate(angle + side*0.1);
    ctx.beginPath(); ctx.arc(0, 0, s*0.16, 0, Math.PI*2); ctx.fillStyle = '#C47800'; ctx.fill();
    ctx.beginPath(); ctx.arc(0, 0, s*0.09, 0, Math.PI*2); ctx.fillStyle = '#F5C060'; ctx.fill();
    ctx.restore();
  });

  // ── Replace nose ──────────────────────────────────────
  ctx.save();
  ctx.translate(nose.x, nose.y); ctx.rotate(angle);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.ellipse(0, 0, s*0.18, s*0.13, 0, 0, Math.PI*2);
  ctx.fillStyle = 'black'; ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  const ng = ctx.createRadialGradient(-s*0.02,-s*0.02,0,0,0,s*0.12);
  ng.addColorStop(0, '#1a0a00'); ng.addColorStop(1, '#0d0500');
  ctx.fillStyle = ng;
  ctx.beginPath(); ctx.ellipse(0, 0, s*0.11, s*0.078, 0, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath(); ctx.ellipse(-s*0.03, -s*0.022, s*0.03, s*0.018, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // ── Cheek markings ────────────────────────────────────
  [lCheek, rCheek].forEach((ch, ci) => {
    const side = ci===0 ? -1 : 1;
    ctx.save(); ctx.translate(ch.x, ch.y); ctx.rotate(angle); ctx.globalAlpha = 0.38;
    for (let k=0; k<3; k++) {
      ctx.beginPath();
      ctx.moveTo(side*(s*0.05+k*s*0.1), -s*0.1); ctx.lineTo(side*(s*0.09+k*s*0.1), s*0.1);
      ctx.strokeStyle = '#1a1a1a'; ctx.lineWidth = s*0.05; ctx.lineCap = 'round'; ctx.stroke();
    }
    ctx.restore();
  });

  // ── Whiskers ──────────────────────────────────────────
  [{ side: -1, ox: -s*0.04 }, { side: 1, ox: s*0.04 }].forEach(({ side, ox }) => {
    for (let j = -1; j <= 1; j++) {
      ctx.save();
      ctx.translate(nose.x+ox, nose.y); ctx.rotate(angle + j*0.22*side);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(side*s*0.65, j*s*0.065);
      ctx.strokeStyle = 'rgba(255,255,255,0.82)'; ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.stroke();
      ctx.restore();
    }
  });
}
