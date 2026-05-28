import { DrawCtx } from '../DrawCtx';

export function drawDog(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose = d.pt(4);
  const lEar = d.pt(127), rEar = d.pt(356);

  // ── Floppy ears ─────────────────────────────────────────
  [{ ear: lEar, side: -1 }, { ear: rEar, side: 1 }].forEach(({ ear, side }) => {
    ctx.save();
    ctx.translate(ear.x, ear.y);
    ctx.rotate(angle + side * 0.18);

    // Outer ear
    const earGrad = ctx.createRadialGradient(side * s * 0.04, s * 0.28, 0, side * s * 0.04, s * 0.3, s * 0.44);
    earGrad.addColorStop(0, '#A0714A');
    earGrad.addColorStop(1, '#6B3D11');
    ctx.fillStyle = earGrad;
    ctx.beginPath();
    ctx.ellipse(side * s * 0.05, s * 0.32, s * 0.22, s * 0.44, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner ear
    ctx.fillStyle = '#C4956A';
    ctx.beginPath();
    ctx.ellipse(side * s * 0.04, s * 0.33, s * 0.12, s * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // ── Nose ───────────────────────────────────────────────
  ctx.save();
  ctx.translate(nose.x, nose.y);
  ctx.rotate(angle);

  const noseGrad = ctx.createRadialGradient(-s * 0.02, -s * 0.02, 0, 0, 0, s * 0.14);
  noseGrad.addColorStop(0, '#2a1205');
  noseGrad.addColorStop(1, '#0d0500');
  ctx.fillStyle = noseGrad;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.13, s * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose shine
  ctx.fillStyle = 'rgba(255,255,255,0.22)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.04, -s * 0.025, s * 0.038, s * 0.022, -0.4, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils
  ctx.fillStyle = '#1a0800';
  [-1, 1].forEach(side => {
    ctx.beginPath();
    ctx.ellipse(side * s * 0.048, s * 0.016, s * 0.032, s * 0.022, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // ── Tongue ─────────────────────────────────────────────
  const mc = d.mouthCenter();
  ctx.save();
  ctx.translate(mc.x, mc.y + s * 0.04);
  ctx.rotate(angle);
  ctx.fillStyle = '#E8607A';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.16, s * 0.1, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#C0405A';
  ctx.lineWidth = s * 0.022;
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, s * 0.28);
  ctx.stroke();
  // Shine on tongue
  ctx.fillStyle = 'rgba(255,200,200,0.28)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.03, s * 0.1, s * 0.032, s * 0.085, -0.2, 0, Math.PI * 2);
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
      ctx.lineTo(side * s * 0.55, j * s * 0.055);
      ctx.strokeStyle = 'rgba(255,255,255,0.88)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
  });

  // ── Eye spots ──────────────────────────────────────────
  ['left' as const, 'right' as const].forEach(side => {
    const eye = d.eyeCenter(side);
    d.oval(eye.x, eye.y - s * 0.1, s * 0.065, s * 0.048, '#5D3A1A', 0.65);
  });
}
