import { DrawCtx } from '../DrawCtx';

export function drawDog(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose   = d.pt(4);
  const lCheek = d.pt(234);
  const rCheek = d.pt(454);
  const fh     = d.pt(10);   // top of forehead

  // ── Ear positioning ───────────────────────────────────────────────────
  // lCheek (234) and rCheek (454) are guaranteed to be on opposite sides.
  // We use their X as horizontal anchors and push Y far above the forehead.
  // The ear hangs downward from the anchor and leans outward (skewed).
  const earOutwardX = Math.abs(rCheek.x - lCheek.x) * 0.18; // extra outward push
  const earAnchorY  = fh.y - s * 0.55;                       // well above hairline

  const ears = [
    { anchorX: lCheek.x - earOutwardX, side: -1 as const },
    { anchorX: rCheek.x + earOutwardX, side:  1 as const },
  ];

  // ── Ears (drawn first — behind face) ─────────────────────────────────
  ears.forEach(({ anchorX, side }) => {
    ctx.save();
    ctx.translate(anchorX, earAnchorY);
    // Lean the ear outward: positive side = right ear leans right, etc.
    ctx.rotate(angle + side * 0.38);

    // Outer ear — tall floppy ellipse hanging downward from anchor
    const earRX = s * 0.24;
    const earRY = s * 0.48;
    const earCY = s * 0.28; // centre of ellipse sits below anchor
    const g = ctx.createRadialGradient(
      side * s * 0.04, earCY - s * 0.10, 0,
      0,               earCY,            earRY,
    );
    g.addColorStop(0,    '#BA8858');
    g.addColorStop(0.5,  '#946030');
    g.addColorStop(1,    '#4A2206');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, earCY, earRX, earRY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner ear — lighter warm tone
    const ig = ctx.createRadialGradient(
      side * s * 0.02, earCY - s * 0.06, 0,
      0,               earCY,            earRY * 0.60,
    );
    ig.addColorStop(0, '#D8AE80');
    ig.addColorStop(1, '#AE7848');
    ctx.fillStyle = ig;
    ctx.beginPath();
    ctx.ellipse(0, earCY + s * 0.02, earRX * 0.52, earRY * 0.58, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  });

  // ── Nose — erase original then draw dog nose ──────────────────────────
  ctx.save();
  ctx.translate(nose.x, nose.y);
  ctx.rotate(angle);
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.ellipse(0, 0, s * 0.20, s * 0.14, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'black';
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';
  const ng = ctx.createRadialGradient(-s * 0.02, -s * 0.02, 0, 0, 0, s * 0.15);
  ng.addColorStop(0, '#2a1205');
  ng.addColorStop(1, '#0d0500');
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
  ctx.ellipse(-s * 0.044, -s * 0.028, s * 0.040, s * 0.024, -0.4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // ── Tongue ────────────────────────────────────────────────────────────
  // The tongue must start BELOW the lower lip and hang downward over the
  // chin — it must never reach up toward the nose.
  //
  // Strategy: anchor at mouthCenter().x, and use nose.y as a reference
  // to compute a Y that is safely below the lower lip.
  // In face meshes the lower lip sits roughly +0.30*s below the nose tip,
  // and the chin at +0.52*s. We start the tongue at +0.30*s (lower lip
  // base) and draw it going ONLY downward.
  const mc         = d.mouthCenter();
  const tongueTopY = nose.y + s * 0.30;  // at the lower lip, never near the nose
  const tongueW    = s * 0.21;
  const tongueH    = s * 0.52;           // hangs well below chin

  ctx.save();
  ctx.translate(mc.x, tongueTopY);
  ctx.rotate(angle);

  // Draw tongue as a rounded rectangle shape:
  // top flat edge, rounded bottom — use a path not an ellipse so the
  // top doesn't bulge back up toward the nose.
  const tg = ctx.createLinearGradient(0, 0, 0, tongueH * 2);
  tg.addColorStop(0,    '#E8607A');
  tg.addColorStop(0.45, '#D45068');
  tg.addColorStop(1,    '#B83055');
  ctx.fillStyle = tg;

  ctx.beginPath();
  // Top edge — flat horizontal line
  ctx.moveTo(-tongueW, 0);
  ctx.lineTo( tongueW, 0);
  // Right side curves down to rounded bottom
  ctx.quadraticCurveTo( tongueW, tongueH * 1.2,  0, tongueH * 2);
  // Left side mirrors
  ctx.quadraticCurveTo(-tongueW, tongueH * 1.2, -tongueW, 0);
  ctx.closePath();
  ctx.fill();

  // Centre crease — runs from top to near the tip
  ctx.strokeStyle = '#A02848';
  ctx.lineWidth   = s * 0.026;
  ctx.lineCap     = 'round';
  ctx.beginPath();
  ctx.moveTo(0, s * 0.01);
  ctx.lineTo(0, tongueH * 1.75);
  ctx.stroke();

  // Highlight strip on the left side
  ctx.fillStyle = 'rgba(255,200,210,0.26)';
  ctx.beginPath();
  ctx.ellipse(-tongueW * 0.40, tongueH * 0.75, tongueW * 0.20, tongueH * 0.42, -0.12, 0, Math.PI * 2);
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
