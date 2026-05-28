import { DrawCtx } from '../DrawCtx';

export function drawBunny(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose   = d.pt(4);
  const lBrow  = d.pt(70);
  const rBrow  = d.pt(300);
  const lCheek = d.pt(234);
  const rCheek = d.pt(454);

  // ── Tall ears ─────────────────────────────────────────
  [{ brow: lBrow, side: -1 }, { brow: rBrow, side: 1 }].forEach(({ brow, side }) => {
    ctx.save();
    ctx.translate(brow.x + side * s * 0.02, brow.y - s * 0.06);
    ctx.rotate(angle + side * 0.07);
    const eg = ctx.createLinearGradient(-s*0.12, -s*0.82, s*0.12, 0);
    eg.addColorStop(0, '#F0E0EE'); eg.addColorStop(1, '#E0C8DC');
    ctx.fillStyle = eg;
    ctx.beginPath(); ctx.ellipse(0, -s*0.44, s*0.14, s*0.5, 0, 0, Math.PI*2); ctx.fill();
    ctx.strokeStyle = '#C8A8C8'; ctx.lineWidth = s*0.018; ctx.stroke();
    // Inner pink
    const ig = ctx.createLinearGradient(0, -s*0.76, 0, -s*0.06);
    ig.addColorStop(0, '#FFB6D9'); ig.addColorStop(1, '#FF80B8');
    ctx.fillStyle = ig;
    ctx.beginPath(); ctx.ellipse(0, -s*0.44, s*0.075, s*0.38, 0, 0, Math.PI*2); ctx.fill();
    ctx.restore();
  });

  // ── Replace nose ──────────────────────────────────────
  ctx.save();
  ctx.translate(nose.x, nose.y); ctx.rotate(angle);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.ellipse(0, 0, s*0.12, s*0.1, 0, 0, Math.PI*2);
  ctx.fillStyle = 'black'; ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  const ng = ctx.createRadialGradient(-s*0.012, -s*0.012, 0, 0, 0, s*0.068);
  ng.addColorStop(0, '#FF8EC0'); ng.addColorStop(1, '#FF5599');
  ctx.fillStyle = ng;
  ctx.beginPath(); ctx.arc(0, 0, s*0.068, 0, Math.PI*2); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,0.4)';
  ctx.beginPath(); ctx.ellipse(-s*0.022, -s*0.02, s*0.022, s*0.014, -0.4, 0, Math.PI*2); ctx.fill();
  ctx.restore();

  // ── Whiskers ──────────────────────────────────────────
  [{ side: -1, ox: -s*0.04 }, { side: 1, ox: s*0.04 }].forEach(({ side, ox }) => {
    for (let j = -1; j <= 1; j++) {
      ctx.save();
      ctx.translate(nose.x+ox, nose.y); ctx.rotate(angle + j*0.18*side);
      ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(side*s*0.52, j*s*0.046);
      ctx.strokeStyle = 'rgba(255,255,255,0.92)'; ctx.lineWidth = 1.6; ctx.lineCap = 'round'; ctx.stroke();
      ctx.restore();
    }
  });

  // ── Rosy cheeks ───────────────────────────────────────
  [lCheek, rCheek].forEach(ch => {
    const g = ctx.createRadialGradient(ch.x, ch.y, 0, ch.x, ch.y, s*0.17);
    g.addColorStop(0, 'rgba(255,120,160,0.44)'); g.addColorStop(1, 'transparent');
    ctx.save(); ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(ch.x, ch.y, s*0.17, s*0.09, angle, 0, Math.PI*2);
    ctx.fill(); ctx.restore();
  });
}
