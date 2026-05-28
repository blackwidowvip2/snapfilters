import { DrawCtx } from '../DrawCtx';

// ── Helpers ────────────────────────────────────────────────────────────────

function drawEyeshadowBase(d: DrawCtx, color: string, alpha: number) {
  const { ctx, s, angle } = d;
  ['left' as const, 'right' as const].forEach(side => {
    const eye = d.eyeCenter(side);
    ctx.save();
    ctx.translate(eye.x, eye.y - s * 0.025);
    ctx.rotate(angle);

    const g = ctx.createRadialGradient(0, -s * 0.02, 0, 0, -s * 0.01, s * 0.16);
    g.addColorStop(0, color.replace(')', `,${alpha})`).replace('rgb(', 'rgba('));
    g.addColorStop(0.55, color.replace(')', `,${alpha * 0.5})`).replace('rgb(', 'rgba('));
    g.addColorStop(1, 'transparent');
    ctx.globalAlpha = 1;
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.018, s * 0.175, s * 0.1, 0, 0, Math.PI * 2);
    ctx.fill();

    // Crease line
    ctx.strokeStyle = color.replace(')', ',0.45)').replace('rgb(', 'rgba(');
    ctx.lineWidth = s * 0.014;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.arc(0, s * 0.012, s * 0.1, Math.PI + 0.28, -0.28);
    ctx.stroke();
    ctx.restore();
  });
}

function drawEyeliner(d: DrawCtx, color = '#000', wing = true) {
  const { ctx, s, angle } = d;
  ['left' as const, 'right' as const].forEach((side, ei) => {
    const eye = d.eyeCenter(side);
    const dir = ei === 0 ? -1 : 1;
    ctx.save();
    ctx.translate(eye.x, eye.y);
    ctx.rotate(angle);
    ctx.strokeStyle = color;
    ctx.lineWidth = s * 0.018;
    ctx.lineCap = 'round';
    ctx.shadowColor = color;
    ctx.shadowBlur = 3;
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.1, Math.PI + 0.2, -0.2);
    ctx.stroke();
    if (wing) {
      ctx.beginPath();
      ctx.moveTo(dir * s * 0.1, -s * 0.01);
      ctx.lineTo(dir * s * 0.165, -s * 0.065);
      ctx.stroke();
    }
    ctx.restore();
  });
}

function drawBlush(d: DrawCtx, color: string, alpha: number) {
  const { ctx, s, angle } = d;
  [d.pt(234), d.pt(454)].forEach(ch => {
    const g = ctx.createRadialGradient(ch.x, ch.y, 0, ch.x, ch.y, s * 0.2);
    g.addColorStop(0, color.replace(')', `,${alpha})`).replace('rgb(', 'rgba('));
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(ch.x, ch.y, s * 0.2, s * 0.1, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawContour(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose = d.pt(4);
  
  const lCheek = d.pt(234), rCheek = d.pt(454);

  // Cheek hollows
  [lCheek, rCheek].forEach((ch, ci) => {
    const side = ci === 0 ? -1 : 1;
    const g = ctx.createRadialGradient(ch.x + side * s * 0.1, ch.y + s * 0.06, 0, ch.x, ch.y, s * 0.28);
    g.addColorStop(0, 'rgba(100,60,30,0.38)');
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(ch.x + side * s * 0.08, ch.y + s * 0.04, s * 0.28, s * 0.1, angle + side * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Nose shadow
  [-1, 1].forEach(side => {
    const g = ctx.createRadialGradient(
      nose.x + side * s * 0.06, nose.y, 0,
      nose.x + side * s * 0.06, nose.y, s * 0.07
    );
    g.addColorStop(0, 'rgba(80,45,25,0.35)');
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(nose.x + side * s * 0.06, nose.y, s * 0.07, s * 0.14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}

function drawHighlighter(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose = d.pt(4);
  
  const lCheek = d.pt(234), rCheek = d.pt(454);
  const mc = d.mouthCenter();

  // Cheekbone highlight
  [lCheek, rCheek].forEach(ch => {
    const g = ctx.createRadialGradient(ch.x, ch.y, 0, ch.x, ch.y, s * 0.22);
    g.addColorStop(0, 'rgba(255,230,160,0.65)');
    g.addColorStop(0.4, 'rgba(255,210,100,0.3)');
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(ch.x, ch.y, s * 0.22, s * 0.1, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // Nose bridge
  ctx.save();
  ctx.translate(nose.x, nose.y - s * 0.22);
  ctx.rotate(angle);
  const ng = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.06);
  ng.addColorStop(0, 'rgba(255,248,200,0.55)');
  ng.addColorStop(1, 'transparent');
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.038, s * 0.25, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Cupid's bow
  ctx.save();
  ctx.translate(mc.x, mc.y - s * 0.13);
  ctx.fillStyle = 'rgba(255,230,170,0.55)';
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.06, s * 0.02, angle, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

// ── Exported filter functions ────────────────────────────────────────────

export function drawLipRed(d: DrawCtx) {
  d.drawLipShape('#CC1010', 0.85, true);
}

export function drawLipPink(d: DrawCtx) {
  d.drawLipShape('#E8609A', 0.8, true);
}

export function drawEyeshadowSmoky(d: DrawCtx) {
  const { ctx, s, angle } = d;
  // Dark base
  ['left' as const, 'right' as const].forEach(side => {
    const eye = d.eyeCenter(side);
    ctx.save();
    ctx.translate(eye.x, eye.y);
    ctx.rotate(angle);
    // Blended smoke
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, s * 0.19);
    g.addColorStop(0, 'rgba(0,0,0,0.58)');
    g.addColorStop(0.6, 'rgba(20,10,30,0.32)');
    g.addColorStop(1, 'transparent');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.008, s * 0.19, s * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    d.drawLashes(eye, side === 'left' ? -1 : 1, '#000', 1.1);
  });
  drawEyeliner(d, '#111', true);
}

export function drawEyeshadowGlam(d: DrawCtx) {
  drawEyeshadowBase(d, 'rgb(180,140,0)', 0.65);
  const { ctx, s, angle, t } = d;
  // Glitter sparkles on lid
  ['left' as const, 'right' as const].forEach(side => {
    const eye = d.eyeCenter(side);
    ctx.save();
    ctx.translate(eye.x, eye.y - s * 0.04);
    ctx.rotate(angle);
    for (let k = 0; k < 12; k++) {
      const a = d.pseudo(k * 3.1 + t * 4) * Math.PI * 2;
      const r = d.pseudo(k * 7.7) * s * 0.12;
      const px = Math.cos(a) * r, py = Math.sin(a) * r - s * 0.02;
      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(t * 2 + k);
      ctx.globalAlpha = 0.7 + Math.sin(t * 5 + k) * 0.25;
      ctx.fillStyle = `hsl(${45 + d.pseudo(k) * 20},100%,${60 + d.pseudo(k * 2) * 25}%)`;
      ctx.shadowColor = '#FFD700';
      ctx.shadowBlur = 6;
      const gs = s * 0.012;
      ctx.fillRect(-gs, -gs, gs * 2, gs * 2);
      ctx.restore();
    }
    ctx.restore();
    d.drawLashes(eye, side === 'left' ? -1 : 1, '#222', 1.2);
  });
  drawEyeliner(d, '#333', true);
}

export function drawFullGlam(d: DrawCtx) {
  drawContour(d);
  drawHighlighter(d);
  drawEyeshadowBase(d, 'rgb(20,10,20)', 0.6);
  drawBlush(d, 'rgb(220,80,100)', 0.35);
  ['left' as const, 'right' as const].forEach(side => {
    const eye = d.eyeCenter(side);
    d.drawLashes(eye, side === 'left' ? -1 : 1, '#000', 1.3);
  });
  drawEyeliner(d, '#000', true);
  d.drawLipShape('#BB0A0A', 0.88, true);
}
