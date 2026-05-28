import { DrawCtx } from '../DrawCtx';

export function drawDog(d: DrawCtx) {
  const { ctx, s, angle } = d;
  const nose    = d.pt(4);
  const lEar    = d.pt(127);
  const rEar    = d.pt(356);
  const lCheek  = d.pt(234);
  const rCheek  = d.pt(454);

  // ── Ears (behind face, drawn first) ───────────────────
  // Large, floppy rounded ears sitting on top of the head, angled outward
  [{ ear: lEar, side: -1 }, { ear: rEar, side: 1 }].forEach(({ ear, side }) => {
    ctx.save();
    ctx.translate(ear.x, ear.y);
    ctx.rotate(angle + side * 0.22);

    // Outer ear — wide, tall, rounded at bottom
    const g = ctx.createRadialGradient(side * s * 0.06, s * 0.18, s * 0.02, side * s * 0.06, s * 0.28, s * 0.62);
    g.addColorStop(0, '#C49A6C');
    g.addColorStop(0.45, '#A0714A');
    g.addColorStop(1, '#6B3E1E');
    ctx.fillStyle = g;
    ctx.beginPath();
    // Custom rounded ear shape using bezier for a more realistic floppy ear
    ctx.moveTo(-s * 0.28, 0);
    ctx.bezierCurveTo(-s * 0.38, s * 0.2, -s * 0.35, s * 0.7, side * s * 0.05, s * 0.78);
    ctx.bezierCurveTo(side * s * 0.3, s * 0.78, s * 0.35, s * 0.5, s * 0.28, 0);
    ctx.closePath();
    ctx.fill();

    // Inner ear — warm pinkish-tan, smaller
    const ig = ctx.createRadialGradient(side * s * 0.03, s * 0.22, 0, side * s * 0.03, s * 0.3, s * 0.38);
    ig.addColorStop(0, '#D4A882');
    ig.addColorStop(1, '#B8855A');
    ctx.fillStyle = ig;
    ctx.beginPath();
    ctx.moveTo(-s * 0.14, s * 0.05);
    ctx.bezierCurveTo(-s * 0.2, s * 0.22, -s * 0.17, s * 0.6, side * s * 0.04, s * 0.65);
    ctx.bezierCurveTo(side * s * 0.18, s * 0.65, s * 0.18, s * 0.38, s * 0.14, s * 0.05);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  });

  // ── Big dog nose (brown, not black) ───────────────────
  // In the reference, the nose is large, warm brown, covering the human nose area
  ctx.save();
  ctx.translate(nose.x, nose.y);
  ctx.rotate(angle);

  // Erase region under nose (slightly larger to cleanly cover human nose)
  ctx.globalCompositeOperation = 'destination-out';
  ctx.beginPath();
  ctx.ellipse(0, s * 0.02, s * 0.28, s * 0.2, 0, 0, Math.PI * 2);
  ctx.fillStyle = 'black';
  ctx.fill();
  ctx.globalCompositeOperation = 'source-over';

  // Main nose body — warm brown radial gradient
  const ng = ctx.createRadialGradient(-s * 0.05, -s * 0.04, 0, 0, 0, s * 0.26);
  ng.addColorStop(0, '#C4895A');
  ng.addColorStop(0.5, '#A06838');
  ng.addColorStop(1, '#7A4820');
  ctx.fillStyle = ng;
  ctx.beginPath();
  // Wide, flat dog nose shape
  ctx.ellipse(0, 0, s * 0.24, s * 0.16, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nose bridge / top highlight area
  const bridgeG = ctx.createLinearGradient(0, -s * 0.16, 0, 0);
  bridgeG.addColorStop(0, 'rgba(180,120,70,0.5)');
  bridgeG.addColorStop(1, 'transparent');
  ctx.fillStyle = bridgeG;
  ctx.beginPath();
  ctx.ellipse(0, -s * 0.06, s * 0.2, s * 0.1, 0, 0, Math.PI * 2);
  ctx.fill();

  // Nostrils — dark, oval, slightly recessed look
  ctx.fillStyle = '#3A1800';
  [-1, 1].forEach(sd => {
    ctx.beginPath();
    ctx.ellipse(sd * s * 0.09, s * 0.04, s * 0.058, s * 0.044, sd * 0.25, 0, Math.PI * 2);
    ctx.fill();
    // Nostril inner shadow
    ctx.fillStyle = '#1A0800';
    ctx.beginPath();
    ctx.ellipse(sd * s * 0.09, s * 0.046, s * 0.038, s * 0.028, sd * 0.25, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3A1800';
  });

  // Nose ridge line (philtrum area)
  ctx.strokeStyle = 'rgba(90,45,10,0.5)';
  ctx.lineWidth = s * 0.018;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, -s * 0.04);
  ctx.lineTo(0, s * 0.1);
  ctx.stroke();

  // Specular highlight on nose
  ctx.fillStyle = 'rgba(255,220,180,0.35)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.06, -s * 0.055, s * 0.07, s * 0.038, -0.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // ── Tongue — wide, long, realistic ────────────────────
  const mc = d.mouthCenter();
  ctx.save();
  ctx.translate(mc.x, mc.y + s * 0.02);
  ctx.rotate(angle);

  // Tongue shadow/base for depth
  ctx.fillStyle = 'rgba(140,50,60,0.4)';
  ctx.beginPath();
  ctx.ellipse(s * 0.01, s * 0.26, s * 0.175, s * 0.33, 0, 0, Math.PI * 2);
  ctx.fill();

  // Main tongue body — wide and long with realistic gradient
  const tg = ctx.createLinearGradient(-s * 0.15, 0, s * 0.15, s * 0.55);
  tg.addColorStop(0, '#E87080');
  tg.addColorStop(0.3, '#D45868');
  tg.addColorStop(0.7, '#C04058');
  tg.addColorStop(1, '#A03048');
  ctx.fillStyle = tg;
  ctx.beginPath();
  // Custom tongue path — wider at top, rounded at bottom
  ctx.moveTo(-s * 0.17, 0);
  ctx.bezierCurveTo(-s * 0.22, s * 0.18, -s * 0.24, s * 0.38, -s * 0.12, s * 0.52);
  ctx.bezierCurveTo(-s * 0.04, s * 0.6, s * 0.04, s * 0.6, s * 0.12, s * 0.52);
  ctx.bezierCurveTo(s * 0.24, s * 0.38, s * 0.22, s * 0.18, s * 0.17, 0);
  ctx.closePath();
  ctx.fill();

  // Tongue surface texture — lighter center band
  const surfG = ctx.createLinearGradient(-s * 0.08, s * 0.05, s * 0.08, s * 0.45);
  surfG.addColorStop(0, 'rgba(255,170,160,0.3)');
  surfG.addColorStop(1, 'rgba(200,100,110,0.1)');
  ctx.fillStyle = surfG;
  ctx.beginPath();
  ctx.ellipse(0, s * 0.25, s * 0.09, s * 0.26, 0, 0, Math.PI * 2);
  ctx.fill();

  // Centre groove line
  ctx.strokeStyle = 'rgba(160,50,65,0.7)';
  ctx.lineWidth = s * 0.028;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, s * 0.02);
  ctx.bezierCurveTo(s * 0.01, s * 0.2, -s * 0.01, s * 0.38, 0, s * 0.52);
  ctx.stroke();

  // Glossy highlight on left side of tongue
  ctx.fillStyle = 'rgba(255,210,210,0.38)';
  ctx.beginPath();
  ctx.ellipse(-s * 0.055, s * 0.18, s * 0.055, s * 0.14, -0.18, 0, Math.PI * 2);
  ctx.fill();

  // Smaller secondary highlight
  ctx.fillStyle = 'rgba(255,230,225,0.22)';
  ctx.beginPath();
  ctx.ellipse(s * 0.04, s * 0.32, s * 0.03, s * 0.07, 0.1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // ── Eye spots / brow spots ────────────────────────────
  // Subtle tan/brown ovals above each eyebrow, as seen in ref image
  (['left', 'right'] as const).forEach(side => {
    const eye = d.eyeCenter(side);
    // Larger, softer brow spot
    const bx = eye.x;
    const by = eye.y - s * 0.15;
    const bg = ctx.createRadialGradient(bx, by, 0, bx, by, s * 0.1);
    bg.addColorStop(0, 'rgba(100,60,20,0.55)');
    bg.addColorStop(1, 'rgba(100,60,20,0)');
    ctx.save();
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.ellipse(bx, by, s * 0.1, s * 0.065, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── Rosy cheeks ───────────────────────────────────────
  [lCheek, rCheek].forEach(ch => {
    const g = ctx.createRadialGradient(ch.x, ch.y, 0, ch.x, ch.y, s * 0.2);
    g.addColorStop(0, 'rgba(210,90,70,0.45)');
    g.addColorStop(0.5, 'rgba(210,90,70,0.2)');
    g.addColorStop(1, 'transparent');
    ctx.save();
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.ellipse(ch.x, ch.y, s * 0.2, s * 0.12, angle, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // ── Whiskers — subtle, fine white lines ───────────────
  [{ side: -1, ox: -s * 0.06 }, { side: 1, ox: s * 0.06 }].forEach(({ side, ox }) => {
    for (let j = -1; j <= 1; j++) {
      ctx.save();
      ctx.translate(nose.x + ox, nose.y + s * 0.02);
      ctx.rotate(angle + j * 0.18 * side);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(side * s * 0.52, j * s * 0.05);
      ctx.strokeStyle = 'rgba(255,255,255,0.72)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      ctx.stroke();
      ctx.restore();
    }
  });
}
