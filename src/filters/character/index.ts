import { DrawCtx } from '../DrawCtx';

// ── Vampire ────────────────────────────────────────────────────────────────
export function drawVampire(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const upperLip = d.pt(12);
  const mc = d.mouthCenter();
  const mL = d.pt(61), mR = d.pt(291);
  const lEye = d.eyeCenter('left'), rEye = d.eyeCenter('right');
  const lBrow = d.pt(70), rBrow = d.pt(300);

  // Dark eyes
  [lEye, rEye].forEach(eye => {
    const g = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, s * 0.11);
    g.addColorStop(0, 'rgba(180,0,0,0.55)');
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Dark arched brows
  [[lBrow, [276,283,282,295,285]], [rBrow, [46,53,52,65,55]]].forEach(([, pts]) => {
    d.drawBrow(pts as number[], '#1a0a14', s * 0.022);
  });

  // Fangs
  ctx.save();
  ctx.translate(mc.x, upperLip.y);
  ctx.rotate(angle);
  [-1, 1].forEach(side => {
    const fg = ctx.createLinearGradient(side * s * 0.055, 0, side * s * 0.025, s * 0.12);
    fg.addColorStop(0, '#f8f0e8');
    fg.addColorStop(1, '#e8d8c8');
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.moveTo(side * s * 0.055, 0);
    ctx.bezierCurveTo(side * s * 0.058, s * 0.04, side * s * 0.03, s * 0.1, side * s * 0.02, s * 0.12);
    ctx.bezierCurveTo(side * s * 0.006, s * 0.12, -side * s * 0.004, s * 0.1, 0, s * 0.08);
    ctx.bezierCurveTo(-side * s * 0.01, s * 0.04, side * s * 0.042, 0, side * s * 0.055, 0);
    ctx.fill();
    ctx.strokeStyle = '#ccbbaa';
    ctx.lineWidth = s * 0.008;
    ctx.stroke();
  });
  ctx.restore();

  // Blood drips from corners
  [mL, mR].forEach(corner => {
    ctx.save();
    ctx.strokeStyle = '#8B0000';
    ctx.lineWidth = s * 0.024;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#8B0000';
    ctx.shadowBlur = 4;
    ctx.globalAlpha = 0.88;
    ctx.beginPath();
    ctx.moveTo(corner.x, corner.y);
    ctx.bezierCurveTo(corner.x + 2, corner.y + s * 0.05, corner.x - 2, corner.y + s * 0.11, corner.x, corner.y + s * 0.15);
    ctx.stroke();
    d.oval(corner.x, corner.y + s * 0.15, s * 0.018, s * 0.018, '#8B0000', 0.88);
    ctx.restore();
  });
}

// ── Zombie ─────────────────────────────────────────────────────────────────
export function drawZombie(d: DrawCtx) {
  const { ctx, s, t } = d;
  const fh = d.pt(10);
  const lEye = d.eyeCenter('left'), rEye = d.eyeCenter('right');
  const lCheek = d.pt(234), rCheek = d.pt(454);

  // Bloodshot eyes
  [lEye, rEye].forEach(eye => {
    ctx.save();
    ctx.translate(eye.x, eye.y);
    d.oval(0, 0, s * 0.07, s * 0.07, 'rgba(215,215,200,0.88)');
    ctx.strokeStyle = 'rgba(180,0,0,0.65)';
    ctx.lineWidth = 1.2;
    for (let k = 0; k < 7; k++) {
      const a = k * 0.9 + t * 0.4;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * s * 0.012, Math.sin(a) * s * 0.012);
      ctx.lineTo(Math.cos(a) * s * 0.062, Math.sin(a) * s * 0.062);
      ctx.stroke();
    }
    ctx.restore();
  });

  // Wound on cheek
  [lCheek, rCheek].forEach((ch, ci) => {
    const side = ci === 0 ? -1 : 1;
    ctx.save();
    ctx.translate(ch.x + side * s * 0.04, ch.y);
    ctx.rotate(d.angle + side * 0.2);
    // Wound base
    ctx.fillStyle = 'rgba(80,0,0,0.72)';
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.1, s * 0.032, 0, 0, Math.PI * 2);
    ctx.fill();
    // Stitches
    ctx.strokeStyle = '#2a1205';
    ctx.lineWidth = s * 0.012;
    for (let k = -2; k <= 2; k++) {
      ctx.beginPath();
      ctx.moveTo(k * s * 0.034, -s * 0.032);
      ctx.lineTo(k * s * 0.034, s * 0.032);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(k * s * 0.034 - s * 0.015, -s * 0.032);
      ctx.lineTo(k * s * 0.034 + s * 0.015, -s * 0.032);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(k * s * 0.034 - s * 0.015, s * 0.032);
      ctx.lineTo(k * s * 0.034 + s * 0.015, s * 0.032);
      ctx.stroke();
    }
    ctx.restore();
  });

  // Blood drips from forehead
  for (let k = 0; k < 4; k++) {
    const bx = fh.x + (k - 1.5) * s * 0.2;
    const dripH = d.pseudo(k + 20) * s * 0.32 + s * 0.1;
    ctx.save();
    ctx.globalAlpha = 0.78;
    const drg = ctx.createLinearGradient(bx, fh.y, bx, fh.y + dripH);
    drg.addColorStop(0, '#8B0000');
    drg.addColorStop(1, '#5a0000');
    ctx.fillStyle = drg;
    ctx.beginPath();
    ctx.ellipse(bx, fh.y + dripH * 0.48, s * 0.02, dripH * 0.52, 0, 0, Math.PI * 2);
    ctx.fill();
    d.oval(bx, fh.y + dripH, s * 0.02, s * 0.02, '#8B0000', 0.75);
    ctx.restore();
  }
}

// ── Devil ──────────────────────────────────────────────────────────────────
export function drawDevil(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const lBrow = d.pt(70), rBrow = d.pt(300);
  const lEye = d.eyeCenter('left'), rEye = d.eyeCenter('right');

  // Horns anchored to brow outer points
  [{ brow: lBrow, side: -1 }, { brow: rBrow, side: 1 }].forEach(({ brow, side }) => {
    ctx.save();
    ctx.translate(brow.x - side * s * 0.12, brow.y - s * 0.04);
    ctx.rotate(angle + side * 0.08);
    const grad = ctx.createLinearGradient(-s * 0.06, 0, s * 0.06, -s * 0.55);
    grad.addColorStop(0, '#8B0000');
    grad.addColorStop(0.5, '#CC2200');
    grad.addColorStop(1, '#FF4400');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(-s * 0.065, 0);
    ctx.lineTo(s * 0.065, 0);
    ctx.bezierCurveTo(s * 0.045, -s * 0.22, side * s * 0.07, -s * 0.38, 0, -s * 0.55);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(80,0,0,0.5)';
    ctx.lineWidth = s * 0.012;
    ctx.stroke();
    ctx.restore();
  });

  // Glowing red eyes
  [lEye, rEye].forEach(eye => {
    const g = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, s * 0.12);
    g.addColorStop(0, 'rgba(255,30,0,0.65)');
    g.addColorStop(0.5, 'rgba(200,0,0,0.32)');
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.shadowColor = '#FF0000';
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, s * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// ── Angel ──────────────────────────────────────────────────────────────────
export function drawAngel(d: DrawCtx) {
  const { ctx, s, angle, t } = d;
  const fh = d.pt(10);
  const lEye = d.eyeCenter('left'), rEye = d.eyeCenter('right');

  // Wings
  [-1, 1].forEach(side => {
    ctx.save();
    ctx.translate(fh.x + side * s * 0.05, fh.y + s * 0.22);
    ctx.rotate(angle + side * 0.15);
    ctx.globalAlpha = 0.45 + Math.sin(t * 1.5) * 0.06;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(side * s * 0.9, -s * 0.32, side * s * 1.2, s * 0.48, side * s * 0.44, s * 0.75);
    ctx.bezierCurveTo(side * s * 0.24, s * 0.52, 0, s * 0.3, 0, 0);
    const wg = ctx.createRadialGradient(side * s * 0.4, s * 0.2, 0, side * s * 0.4, s * 0.2, s * 0.7);
    wg.addColorStop(0, 'rgba(255,255,255,0.9)');
    wg.addColorStop(0.6, 'rgba(255,240,200,0.55)');
    wg.addColorStop(1, 'transparent');
    ctx.fillStyle = wg;
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,240,180,0.45)';
    ctx.lineWidth = s * 0.014;
    ctx.stroke();
    ctx.restore();
  });

  // Halo
  ctx.save();
  ctx.translate(fh.x, fh.y - s * 0.5);
  ctx.rotate(angle);
  const haloGlow = ctx.createRadialGradient(0, 0, s * 0.28, 0, 0, s * 0.52);
  haloGlow.addColorStop(0, 'rgba(255,215,0,0.0)');
  haloGlow.addColorStop(0.5, 'rgba(255,215,0,0.2)');
  haloGlow.addColorStop(1, 'transparent');
  ctx.fillStyle = haloGlow;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.52, s * 0.15, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,215,0,0.92)';
  ctx.lineWidth = s * 0.055;
  ctx.shadowColor = '#FFD700';
  ctx.shadowBlur = 20;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.4, s * 0.11, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Gold eye shimmer
  [lEye, rEye].forEach(eye => {
    const g = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, s * 0.1);
    g.addColorStop(0, 'rgba(255,215,0,0.42)');
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

// ── Alien ──────────────────────────────────────────────────────────────────
export function drawAlien(d: DrawCtx) {
  const { ctx, s, angle, t } = d;
  const fh = d.pt(10);
  const lEye = d.eyeCenter('left'), rEye = d.eyeCenter('right');
  const mc = d.mouthCenter();

  // Dome glow
  ctx.save();
  ctx.translate(fh.x, fh.y - s * 0.38);
  ctx.rotate(angle);
  const dg = ctx.createRadialGradient(0, -s * 0.1, 0, 0, -s * 0.08, s * 0.64);
  dg.addColorStop(0, 'rgba(120,255,120,0.08)');
  dg.addColorStop(0.6, 'rgba(80,255,80,0.14)');
  dg.addColorStop(1, 'transparent');
  ctx.fillStyle = dg;
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.08, s * 0.56, s * 0.64, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Large black eyes
  [lEye, rEye].forEach(eye => {
    ctx.save();
    ctx.translate(eye.x, eye.y);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.14, s * 0.092, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#030810';
    ctx.fill();
    // Green shimmer
    const g = ctx.createRadialGradient(-s * 0.04, -s * 0.03, 0, 0, 0, s * 0.13);
    g.addColorStop(0, 'rgba(80,255,100,0.32)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.fill();
    // Eye shine
    ctx.fillStyle = 'rgba(180,255,180,0.45)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.038, -s * 0.028, s * 0.03, s * 0.02, -0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Bioluminescent markings
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + t * 0.45;
    const px = fh.x + Math.cos(a) * s * 0.3;
    const py = fh.y - s * 0.1 + Math.sin(a) * s * 0.14;
    ctx.save();
    ctx.globalAlpha = 0.45 + Math.sin(t * 2.5 + k) * 0.3;
    ctx.fillStyle = '#00FF80';
    ctx.shadowColor = '#00FF80';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(px, py, s * 0.014, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Thin mouth
  ctx.save();
  ctx.translate(mc.x, mc.y);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.07, s * 0.014, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#003300';
  ctx.fill();
  ctx.restore();
}
