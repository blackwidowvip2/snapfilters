import { DrawCtx } from '../DrawCtx';

// ── Neon ───────────────────────────────────────────────────────────────────
export function drawNeonOverlay(d: DrawCtx) {
  // Neon is primarily a pixel filter; add face-mesh glow lines on top
  if (!d.lm.length) return;
  const { ctx, t } = d;
  const paths = [
    [61,185,40,39,37,0,267,269,270,409,291,375,321,405,314,17,84,181,91,146],
    [33,160,158,133,153,144],
    [362,385,387,263,373,380],
    [70,63,105,66,107],
    [336,296,334,293,300],
  ];
  const hue = (t * 50) % 360;
  ctx.save();
  ctx.strokeStyle = `hsl(${hue},100%,62%)`;
  ctx.lineWidth = 1.8;
  ctx.shadowColor = `hsl(${hue},100%,62%)`;
  ctx.shadowBlur = 16;
  ctx.globalAlpha = 0.85;
  paths.forEach((p, pi) => {
    const start = d.pt(p[0]);
    ctx.beginPath();
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < p.length; i++) {
      const pp = d.pt(p[i]);
      ctx.lineTo(pp.x, pp.y);
    }
    if (pi === 0) ctx.closePath();
    ctx.stroke();
  });
  ctx.restore();
}

// ── Cyberpunk ──────────────────────────────────────────────────────────────
export function drawCyberpunk(d: DrawCtx) {
  const { ctx, s, angle, t } = d;
  const lEye = d.eyeCenter('left'), rEye = d.eyeCenter('right');
  const fh = d.pt(10), chin = d.pt(152);
  const lCheek = d.pt(234), rCheek = d.pt(454);

  // Circuit traces on cheeks
  [lCheek, rCheek].forEach((ch, ci) => {
    const side = ci === 0 ? -1 : 1;
    const hue = ci === 0 ? 188 : 302;
    ctx.save();
    ctx.translate(ch.x, ch.y);
    ctx.rotate(angle);
    ctx.strokeStyle = `hsla(${hue},100%,60%,0.72)`;
    ctx.lineWidth = s * 0.013;
    ctx.lineCap = 'square';
    ctx.shadowColor = `hsl(${hue},100%,60%)`;
    ctx.shadowBlur = 10;
    // Circuit path
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(side * s * 0.14, 0);
    ctx.lineTo(side * s * 0.14, -s * 0.07);
    ctx.lineTo(side * s * 0.24, -s * 0.07);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0, s * 0.05);
    ctx.lineTo(side * s * 0.2, s * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(side * s * 0.1, s * 0.05);
    ctx.lineTo(side * s * 0.1, s * 0.1);
    ctx.stroke();
    // Nodes
    ctx.fillStyle = `hsl(${hue},100%,68%)`;
    [
      [side * s * 0.14, -s * 0.07],
      [side * s * 0.24, -s * 0.07],
      [side * s * 0.1, s * 0.1],
    ].forEach(([nx, ny]) => {
      ctx.beginPath();
      ctx.arc(nx, ny, s * 0.018, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.restore();
  });

  // HUD rings around eyes
  [lEye, rEye].forEach((eye, ei) => {
    const hue = ei === 0 ? 188 : 302;
    // Glow
    const g = ctx.createRadialGradient(eye.x, eye.y, 0, eye.x, eye.y, s * 0.14);
    g.addColorStop(0, `hsla(${hue},100%,60%,0.5)`);
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, s * 0.14, 0, Math.PI * 2);
    ctx.fill();

    // Arc rings
    ctx.translate(eye.x, eye.y);
    ctx.strokeStyle = `hsla(${hue},100%,62%,0.55)`;
    ctx.lineWidth = s * 0.018;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.115, 0, Math.PI * 1.65);
    ctx.stroke();
    ctx.strokeStyle = `hsla(${hue},100%,62%,0.3)`;
    ctx.lineWidth = s * 0.024;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.148, -0.5, Math.PI * 1.1);
    ctx.stroke();
    ctx.restore();
  });

  // Scanning line
  const scanY = fh.y + (((t * 0.5) % 1)) * (chin.y - fh.y);
  ctx.save();
  ctx.globalAlpha = 0.24;
  const sg = ctx.createLinearGradient(0, scanY - s * 0.045, 0, scanY + s * 0.045);
  sg.addColorStop(0, 'transparent');
  sg.addColorStop(0.5, 'rgba(0,255,200,0.55)');
  sg.addColorStop(1, 'transparent');
  ctx.fillStyle = sg;
  ctx.fillRect(0, scanY - s * 0.045, d.W, s * 0.09);
  ctx.restore();
}

// ── Gold ───────────────────────────────────────────────────────────────────
export function drawGold(d: DrawCtx) {
  const { ctx, s, angle, t } = d;
  const fh = d.pt(10);
  const lEye = d.eyeCenter('left'), rEye = d.eyeCenter('right');
  const lBrow = d.pt(70), rBrow = d.pt(300);

  // Gold particle field
  for (let k = 0; k < 22; k++) {
    const a = (k / 22) * Math.PI * 2 + t * 0.38;
    const r = s * (0.5 + d.pseudo(k) * 0.35);
    const px = fh.x + Math.cos(a) * r;
    const py = fh.y + Math.sin(a) * r * 0.65;
    const gs = s * (0.014 + d.pseudo(k * 2) * 0.018);
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(t * 1.8 + k);
    ctx.globalAlpha = 0.6 + Math.sin(t * 2.8 + k) * 0.32;
    ctx.fillStyle = `hsl(${38 + d.pseudo(k) * 22},100%,${55 + d.pseudo(k * 3) * 24}%)`;
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 10;
    ctx.fillRect(-gs, -gs, gs * 2, gs * 2);
    ctx.restore();
  }

  // Gold eyeliner
  [lEye, rEye].forEach((eye, ei) => {
    const side = ei === 0 ? -1 : 1;
    ctx.save();
    ctx.translate(eye.x, eye.y);
    ctx.rotate(angle);
    ctx.strokeStyle = '#C8A800';
    ctx.lineWidth = s * 0.024;
    ctx.lineCap = 'round';
    ctx.shadowColor = '#FFD700';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, Math.PI + 0.18, -0.18);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(side * s * 0.1, -s * 0.01);
    ctx.lineTo(side * s * 0.165, -s * 0.07);
    ctx.stroke();
    ctx.restore();
  });

  // Gold brow shimmer
  [lBrow, rBrow].forEach(brow => {
    ctx.save();
    ctx.translate(brow.x, brow.y);
    ctx.rotate(angle);
    const bg = ctx.createLinearGradient(-s * 0.24, 0, s * 0.24, 0);
    bg.addColorStop(0, 'transparent');
    bg.addColorStop(0.5, 'rgba(220,180,0,0.55)');
    bg.addColorStop(1, 'transparent');
    ctx.fillStyle = bg;
    ctx.globalAlpha = 0.72;
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.24, s * 0.032, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Gold lip tint
  d.drawLipShape('rgba(210,170,0,0.7)', 0.65, true);
}
