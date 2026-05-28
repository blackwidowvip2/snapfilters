import { DrawCtx } from '../DrawCtx';

export function drawDog(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose   = d.pt(4);
  const lCheek = d.pt(234);
  const rCheek = d.pt(454);

  // ── Ear anchor points: above the forehead, derived from eye centres ──
  // We offset significantly upward (−Y) and slightly outward (±X) so the
  // ears sit at the very top of the head, matching the reference image.
  const lEye = d.eyeCenter('left');
  const rEye = d.eyeCenter('right');
  const eyeSpan = Math.abs(rEye.x - lEye.x);          // face-width proxy

  // Each ear is anchored where it meets the scalp; the visible body hangs down.
  const lEarAnchor = {
    x: lEye.x - eyeSpan * 0.28,
    y: lEye.y - s * 0.82,
  };
  const rEarAnchor = {
    x: rEye.x + eyeSpan * 0.28,
    y: rEye.y - s * 0.82,
  };

  // ── Ears (drawn behind everything else) ──────────────────────────────
  [
    { anchor: lEarAnchor, side: -1 as const },
    { anchor: rEarAnchor, side:  1 as const },
  ].forEach(({ anchor, side }) => {
    ctx.save();
    // Translate to anchor point; the ear body is drawn centred slightly
    // below the anchor so it appears to droop naturally from the scalp.
    ctx.translate(anchor.x, anchor.y);
    ctx.rotate(angle + side * 0.10);   // slight outward tilt per side

    // Outer ear — large floppy ellipse drooping downward
    const earCX = side * s * 0.02;
    const earCY = s * 0.30;            // centre of ellipse below anchor
    const earRX = s * 0.26;
    const earRY = s * 0.50;
    const g = ctx.createRadialGradient(
      earCX - side * s * 0.04, earCY - s * 0.08, 0,
      earCX,                   earCY,             earRY,
    );
    g.addColorStop(0, '#B8845A');
    g.addColorStop(0.55, '#96612F');
    g.addColorStop(1,    '#4C2508');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(earCX, earCY, earRX, earRY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner ear — warm lighter tone
    const ig = ctx.createRadialGradient(
      earCX, earCY - s * 0.06, 0,
      earCX, earCY,            earRY * 0.62,
    );
    ig.addColorStop(0, '#D4A882');
    ig.addColorStop(1, '#B07848');
    ctx.fillStyle = ig;
    ctx.beginPath();
    ctx.ellipse(earCX, earCY + s * 0.02, earRX * 0.55, earRY * 0.60, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // ── Nose — erase original then draw dog nose ──────────────────────────
  ctx.save();
  ctx.translate(nose.x, nose.y);
  ctx.rotate(angle);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.2, s * 0.14, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'black';
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  const ng = ctx.createRadialGradient(-s * 0.02, -s * 0.02, 0, 0, 0, s * 0.15);
  ng.addColorStop(0, '#2a1205'); ng.addColorStop(1, '#0d0500');
  ctx.fillStyle = ng;
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.15, s * 0.10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#1a0800';
  [-1, 1].forEach(sd => {
    ctx.beginPath();
    ctx.ellipse(sd * s * 0.05, s * 0.02, s * 0.035, s * 0.024, 0, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.fillStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.044, -s * 0.028, s * 0.04, s * 0.024, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Tongue ────────────────────────────────────────────────────────────
  // Anchor at the lower lip so the tongue appears to protrude from the mouth
  // and hang far below the chin, matching the reference image.
  const mc          = d.mouthCenter();
  const lowerLip    = d.pt(17);   // bottom of lower lip / chin landmark
  const tongueTopY  = lowerLip.y; // tongue starts flush with the lower lip

  ctx.save();
  ctx.translate(mc.x, tongueTopY);
  ctx.rotate(angle);

  // Tongue body — tall rounded rectangle drawn via a wide ellipse
  const tongueW  = s * 0.22;   // half-width  (wider than original)
  const tongueH  = s * 0.56;   // half-height (much longer, hangs below chin)
  const tg = ctx.createLinearGradient(0, 0, 0, tongueH * 2);
  tg.addColorStop(0,   '#E8607A');
  tg.addColorStop(0.5, '#D45068');
  tg.addColorStop(1,   '#B83055');
  ctx.fillStyle = tg;
  ctx.beginPath();
  ctx.ellipse(0, tongueH, tongueW, tongueH, 0, 0, Math.PI * 2);
  ctx.fill();

  // Centre crease — runs the full length of the tongue
  ctx.strokeStyle = '#B03050';
  ctx.lineWidth   = s * 0.025;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(0, s * 0.02);
  ctx.lineTo(0, tongueH * 1.82);
  ctx.stroke();

  // Highlight along the left side
  ctx.fillStyle = 'rgba(255,200,210,0.28)';
  ctx.beginPath();
  ctx.ellipse(-tongueW * 0.38, tongueH * 0.7, tongueW * 0.22, tongueH * 0.45, -0.15, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // ── Eye spots ─────────────────────────────────────────────────────────
  (['left', 'right'] as const).forEach(side => {
    const eye = d.eyeCenter(side);
    d.oval(eye.x, eye.y - s * 0.12, s * 0.07, s * 0.05, '#5D3A1A', 0.7);
  });

  // ── Whiskers ──────────────────────────────────────────────────────────
  [{ side: -1, ox: -s * 0.04 }, { side: 1, ox: s * 0.04 }].forEach(({ side, ox }) => {
    for (let j = -1; j <= 1; j++) {
      ctx.save();
      ctx.translate(nose.x + ox, nose.y);
      ctx.rotate(angle + j * 0.22 * side);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(side * s * 0.58, j * s * 0.06);
      ctx.strokeStyle = 'rgba(255,255,255,0.88)';
      ctx.lineWidth   = 1.8;
      ctx.lineCap     = 'round';
      ctx.stroke();
      ctx.restore();
    }
  });

  // ── Rosy cheeks ───────────────────────────────────────────────────────
  [lCheek, rCheek].forEach(ch => {
    const g = ctx.createRadialGradient(ch.x, ch.y, 0, ch.x, ch.y, s * 0.16);
    g.addColorStop(0, 'rgba(220,100,80,0.38)');
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(ch.x, ch.y, s * 0.16, s * 0.09, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });
}
