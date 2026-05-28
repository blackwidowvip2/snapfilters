import { DrawCtx } from '../DrawCtx';

export function drawDog(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose    = d.pt(4);
  const lEar    = d.pt(127);
  const rEar    = d.pt(356);
  const lCheek  = d.pt(234);
  const rCheek  = d.pt(454);

  // ── Ears (behind face, drawn first) ───────────────────
  [{ ear: lEar, side: -1 }, { ear: rEar, side: 1 }].forEach(({ ear, side }) => {
    ctx.save();
    ctx.translate(ear.x, ear.y);
    ctx.rotate(angle + side * 0.15);
    const g = ctx.createRadialGradient(side * s * 0.04, s * 0.24, 0, side * s * 0.04, s * 0.3, s * 0.48);
    g.addColorStop(0, '#A0714A');
    g.addColorStop(1, '#5E3310');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(side * s * 0.04, s * 0.3, s * 0.24, s * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    // Inner
    ctx.fillStyle = '#C4956A';
    ctx.beginPath();
    ctx.ellipse(side * s * 0.03, s * 0.31, s * 0.13, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── Nose — erase original then draw new ───────────────
  ctx.save();
  ctx.translate(nose.x, nose.y);
  ctx.rotate(angle);
  // Erase region under nose
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.2, s * 0.14, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'black';
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  // Draw dog nose
  const ng = ctx.createRadialGradient(-s * 0.02, -s * 0.02, 0, 0, 0, s * 0.15);
  ng.addColorStop(0, '#2a1205'); ng.addColorStop(1, '#0d0500');
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.15, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();
  // Nostrils
  ctx.fillStyle = '#1a0800';
  [-1, 1].forEach(sd => {
    ctx.beginPath();
    ctx.ellipse(sd * s * 0.05, s * 0.02, s * 0.035, s * 0.024, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  // Shine
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.044, -s * 0.028, s * 0.04, s * 0.024, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Tongue ────────────────────────────────────────────
  const mc = d.mouthCenter();
  ctx.save();
  ctx.translate(mc.x, mc.y + s * 0.04);
  ctx.rotate(angle);
  const tg = ctx.createLinearGradient(0, 0, 0, s * 0.32);
  tg.addColorStop(0, '#E8607A'); tg.addColorStop(1, '#C0405A');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.ellipse(0, s * 0.17, s * 0.11, s * 0.22, 0, 0, Math.PI * 2);
  ctx.fill();
  // Centre line
  ctx.strokeStyle = '#C0405A'; ctx.lineWidth = s * 0.022; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, s * 0.3); ctx.stroke();
  // Shine
  ctx.fillStyle = 'rgba(255,200,200,0.3)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.03, s * 0.1, s * 0.035, s * 0.09, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Eye spots ─────────────────────────────────────────
  (['left', 'right'] as const).forEach(side => {
    const eye = d.eyeCenter(side);
    d.oval(eye.x, eye.y - s * 0.12, s * 0.07, s * 0.05, '#5D3A1A', 0.7);
  });

  // ── Whiskers ──────────────────────────────────────────
  [{ side: -1, ox: -s * 0.04 }, { side: 1, ox: s * 0.04 }].forEach(({ side, ox }) => {
    for (let j = -1; j <= 1; j++) {
      ctx.save();
      ctx.translate(nose.x + ox, nose.y);
      ctx.rotate(angle + j * 0.22 * side);
      ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(side * s * 0.58, j * s * 0.06);
      ctx.strokeStyle = 'rgba(255,255,255,0.88)';
      ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.stroke();
      ctx.restore();
    }
  });

  // ── Rosy cheeks ───────────────────────────────────────
  [lCheek, rCheek].forEach(ch => {
    const g = ctx.createRadialGradient(ch.x, ch.y, 0, ch.x, ch.y, s * 0.16);
    g.addColorStop(0, 'rgba(220,100,80,0.38)'); g.addColorStop(1, 'transparent');
    ctx.save(); ctx.fillStyle = g;
    ctx.beginPath(); ctx.ellipse(ch.x, ch.y, s * 0.16, s * 0.09, angle, 0, Math.PI * 2);
    ctx.fill(); ctx.restore();
  });
}
