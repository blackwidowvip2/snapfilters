import { DrawCtx } from '../DrawCtx';

export function drawBunny(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose   = d.pt(4);
  const lCheek = d.pt(234);
  const rCheek = d.pt(454);

  const lEye    = d.eyeCenter('left');
  const rEye    = d.eyeCenter('right');
  const faceX   = (lEye.x + rEye.x) / 2;
  const faceY   = (lEye.y + rEye.y) / 2;

  // ── Tall upright ears ─────────────────────────────────
  // Reference image: two tall, slightly tapered ears standing upright on the
  // forehead, leaning gently outward, white outer fur with a soft pink inner.
  // Anchored on the forehead (well above the eyes) at faceY - s*0.55, spread
  // to each side by ±s*0.30.
  [
    { side: -1 as const },
    { side:  1 as const },
  ].forEach(({ side }) => {
    const baseX = faceX + side * s * 0.30;
    const baseY = faceY - s * 0.55;   // sits on the forehead

    ctx.save();
    ctx.translate(baseX, baseY);
    ctx.rotate(angle + side * 0.18);   // lean outward from the head

    // Ear dimensions
    const earH  = s * 1.05;   // total height (tall)
    const earW  = s * 0.17;   // half-width at the widest point

    // ── Outer ear (white fur with subtle shading) ──
    const eg = ctx.createLinearGradient(-earW, 0, earW, 0);
    eg.addColorStop(0,   '#EFE2EC');
    eg.addColorStop(0.5, '#FFFFFF');
    eg.addColorStop(1,   '#E2CFDD');
    ctx.fillStyle = eg;

    // Pointed-oval ear shape via bezier curves: base at (0,0), tip at (0,-earH)
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.bezierCurveTo(-earW, -earH * 0.18, -earW, -earH * 0.78, 0, -earH);
    ctx.bezierCurveTo( earW, -earH * 0.78,  earW, -earH * 0.18, 0, 0);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#D8BFD3';
    ctx.lineWidth   = s * 0.012;
    ctx.stroke();

    // ── Inner ear (pink) ──
    const innerH = earH * 0.80;
    const innerW = earW * 0.55;
    const ig = ctx.createLinearGradient(0, -innerH, 0, -earH * 0.08);
    ig.addColorStop(0, '#FFB6D4');
    ig.addColorStop(1, '#FF7AAE');
    ctx.fillStyle = ig;
    ctx.beginPath();
    ctx.moveTo(0, -earH * 0.10);
    ctx.bezierCurveTo(-innerW, -earH * 0.22, -innerW, -innerH * 0.92, 0, -innerH);
    ctx.bezierCurveTo( innerW, -innerH * 0.92,  innerW, -earH * 0.22, 0, -earH * 0.10);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });

  // ── Replace nose (pink bunny nose) ────────────────────
  ctx.save();
  ctx.translate(nose.x, nose.y); ctx.rotate(angle);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath(); ctx.ellipse(0, 0, s*0.12, s*0.1, 0, 0, Math.PI*2);
  ctx.fillStyle = 'black'; ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // Pink rounded nose — shaped like the upside-down triangle/heart in the image
  const ng = ctx.createRadialGradient(-s*0.012, -s*0.018, 0, 0, 0, s*0.085);
  ng.addColorStop(0, '#FF9ECB'); ng.addColorStop(1, '#F25C9A');
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.moveTo(-s*0.075, -s*0.03);
  ctx.bezierCurveTo(-s*0.075, s*0.03, -s*0.03, s*0.055, 0, s*0.075);
  ctx.bezierCurveTo(s*0.03, s*0.055, s*0.075, s*0.03, s*0.075, -s*0.03);
  ctx.bezierCurveTo(s*0.045, -s*0.06, -s*0.045, -s*0.06, -s*0.075, -s*0.03);
  ctx.closePath();
  ctx.fill();

  // Highlight
  ctx.fillStyle = 'rgba(255,255,255,0.45)';
  ctx.beginPath(); ctx.ellipse(-s*0.022, -s*0.022, s*0.022, s*0.014, -0.4, 0, Math.PI*2); ctx.fill();

  // Vertical philtrum line below nose
  ctx.strokeStyle = 'rgba(220,90,140,0.55)';
  ctx.lineWidth = s*0.014; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, s*0.075); ctx.lineTo(0, s*0.16); ctx.stroke();

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
