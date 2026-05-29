import { DrawCtx } from '../DrawCtx';

export function drawDog(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose   = d.pt(4);
  const lCheek = d.pt(234);
  const rCheek = d.pt(454);

  const lEye    = d.eyeCenter('left');
  const rEye    = d.eyeCenter('right');
  const faceX   = (lEye.x + rEye.x) / 2;
  const faceY   = (lEye.y + rEye.y) / 2;

  // ── Ears ─────────────────────────────────────────────────────────────
  // Anchor = top-centre of head, then spread wide to each side.
  // faceY - s*0.85 places the anchor well above the hairline.
  // side * s * 0.55 spreads them far to the left/right of the face centre.
  // Each ear tilts ~25° outward so it hangs diagonally (as in dog.jpg).
  //
  //   left ear: anchored upper-left, droops lower-right
  //   right ear: anchored upper-right, droops lower-left
  [
    { side: -1 as const },
    { side:  1 as const },
  ].forEach(({ side }) => {
    const anchorX = faceX + side * s * 0.55;
    const anchorY = faceY - s * 0.85;

    ctx.save();
    ctx.translate(anchorX, anchorY);
    // Tilt: outward ear leans away from face centre; negative side tilts left
    ctx.rotate(angle + side * 0.42);

    // The ear body hangs BELOW the anchor, so ellipse centre is at (0, +earRY).
    const earRX = s * 0.22;
    const earRY = s * 0.46;

    // Outer ear
    const g = ctx.createRadialGradient(
      -side * s * 0.04, earRY * 0.45, 0,
               0,       earRY,        earRY * 1.1,
    );
    g.addColorStop(0,    '#C49060');
    g.addColorStop(0.50, '#9A6230');
    g.addColorStop(1,    '#4C2508');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(0, earRY, earRX, earRY, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner ear
    const ig = ctx.createRadialGradient(0, earRY * 0.70, 0, 0, earRY, earRY * 0.60);
    ig.addColorStop(0, '#DEB07A');
    ig.addColorStop(1, '#B07848');
    ctx.fillStyle = ig;
    ctx.beginPath();
    ctx.ellipse(0, earRY + s * 0.01, earRX * 0.52, earRY * 0.56, 0, 0, Math.PI * 2);
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
  // The tongue must hang FROM the lower lip downward — never touching the nose.
  //
  // Strategy:
  //  1. Find the lower-lip Y by taking mouthCenter and adding a fixed offset.
  //     (We avoid d.pt(17) which may sit near the nose in some mesh layouts.)
  //  2. Translate to (mouthCenter.x, lowerLipY) — this is the TOP edge of tongue.
  //  3. Draw a rounded-rectangle shape whose TOP is at local y=0 and extends
  //     downward. This guarantees the tongue never goes above the lower lip.
  {
    const mc         = d.mouthCenter();
    // Lower lip sits ~10% of scale below the mouth-center landmark.
    const lowerLipY  = mc.y + s * 0.10;
    const tongueW    = s * 0.20;   // half-width
    const tongueLen  = s * 0.62;   // total length hanging below lower lip
    const roundR     = tongueW;    // radius of rounded bottom

    ctx.save();
    ctx.translate(mc.x, lowerLipY);
    ctx.rotate(angle);

    // Rounded-rect path: top at y=0, bottom at y=tongueLen, rounded base.
    const tg = ctx.createLinearGradient(0, 0, 0, tongueLen);
    tg.addColorStop(0,   '#E8607A');
    tg.addColorStop(0.55,'#D04868');
    tg.addColorStop(1,   '#B02850');
    ctx.fillStyle = tg;

    ctx.beginPath();
    ctx.moveTo(-tongueW, 0);
    ctx.lineTo(-tongueW, tongueLen - roundR);
    ctx.arc(0, tongueLen - roundR, roundR, Math.PI, 0, false);
    ctx.lineTo(tongueW, 0);
    ctx.closePath();
    ctx.fill();

    // Centre crease
    ctx.strokeStyle = 'rgba(140,30,55,0.70)';
    ctx.lineWidth   = s * 0.024;
    ctx.lineCap     = 'round';
    ctx.beginPath();
    ctx.moveTo(0, s * 0.04);
    ctx.lineTo(0, tongueLen - roundR * 0.3);
    ctx.stroke();

    // Highlight
    ctx.fillStyle = 'rgba(255,200,210,0.26)';
    ctx.beginPath();
    ctx.ellipse(-tongueW * 0.36, tongueLen * 0.38, tongueW * 0.20, tongueLen * 0.28, -0.15, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

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
