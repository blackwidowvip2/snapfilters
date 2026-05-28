import { DrawCtx } from './DrawCtx';
import {
  pxNeon, pxGlitch, pxThermal, pxZombie, pxVampire, pxCyberpunk,
  pxNoir, pxCartoon, pxWatercolor, pxOilPaint, pxNightVision, pxHologram, pxInfrared,
} from './pixelFilters';
import { drawDog }   from './animal/dog';
import { drawCat }   from './animal/cat';
import { drawBunny } from './animal/bunny';
import { drawFox }   from './animal/fox';
import { drawLion }  from './animal/lion';
import { drawLipRed, drawLipPink, drawEyeshadowSmoky, drawEyeshadowGlam, drawFullGlam } from './makeup/index';
import { drawVampire, drawZombie, drawDevil, drawAngel, drawAlien } from './character/index';
import { drawNeonOverlay, drawCyberpunk, drawGold, drawCartoon, drawNoir, drawWatercolor, drawOilPaint, drawNightVision, drawHologram, drawInfrared } from './style/index';
import type { LandmarkList } from '../types';

// Filters that skip pixel processing (canvas overlay only)
const NO_PIXEL = new Set([
  'none','dog','cat','bunny','fox','lion',
  'lip_red','lip_pink','eyeshadow_smoky','eyeshadow_glam','full_glam',
  'vampire','devil','angel','alien',
  'gold',
]);

export function applyPixelFilter(
  ctx: CanvasRenderingContext2D,
  filterId: string,
  W: number, H: number, t: number,
) {
  if (NO_PIXEL.has(filterId)) return;
  try {
    const id = ctx.getImageData(0, 0, W, H);
    let out: ImageData | null = null;
    switch (filterId) {
      case 'neon':         out = pxNeon(id.data, W, H, t);        break;
      case 'glitch':       out = pxGlitch(id.data, W, H, t);      break;
      case 'thermal':      out = pxThermal(id.data, W, H);        break;
      case 'zombie':       out = pxZombie(id.data, W, H);         break;
      case 'vampire':      out = pxVampire(id.data, W, H);        break;
      case 'cyberpunk':    out = pxCyberpunk(id.data, W, H);      break;
      case 'noir':         out = pxNoir(id.data, W, H);           break;
      case 'cartoon':      out = pxCartoon(id.data, W, H);        break;
      case 'watercolor':   out = pxWatercolor(id.data, W, H);     break;
      case 'oil_paint':    out = pxOilPaint(id.data, W, H);       break;
      case 'night_vision': out = pxNightVision(id.data, W, H);    break;
      case 'hologram':     out = pxHologram(id.data, W, H);       break;
      case 'infrared':     out = pxInfrared(id.data, W, H);       break;
    }
    if (out) ctx.putImageData(out, 0, 0);
  } catch (_) { /* taint errors ignored */ }
}

export function applyOverlayFilter(
  ctx: CanvasRenderingContext2D,
  filterId: string,
  landmarks: LandmarkList | null,
  W: number, H: number, t: number,
) {
  if (filterId === 'none') return;

  // Pixel-only filters with no overlay
  const PIXEL_ONLY = new Set(['glitch','thermal','watercolor','oil_paint','infrared']);
  if (PIXEL_ONLY.has(filterId) && !landmarks) return;

  const needsLandmarks = !new Set(['glitch','thermal']).has(filterId);
  if (needsLandmarks && !landmarks) return;

  const d = landmarks ? new DrawCtx(ctx, landmarks, W, H, t) : null;

  switch (filterId) {
    // Animal
    case 'dog':    d && drawDog(d);    break;
    case 'cat':    d && drawCat(d);    break;
    case 'bunny':  d && drawBunny(d);  break;
    case 'fox':    d && drawFox(d);    break;
    case 'lion':   d && drawLion(d);   break;
    // Makeup
    case 'lip_red':         d && drawLipRed(d);         break;
    case 'lip_pink':        d && drawLipPink(d);        break;
    case 'eyeshadow_smoky': d && drawEyeshadowSmoky(d); break;
    case 'eyeshadow_glam':  d && drawEyeshadowGlam(d);  break;
    case 'full_glam':       d && drawFullGlam(d);       break;
    // Character
    case 'vampire': d && drawVampire(d); break;
    case 'zombie':  d && drawZombie(d);  break;
    case 'devil':   d && drawDevil(d);   break;
    case 'angel':   d && drawAngel(d);   break;
    case 'alien':   d && drawAlien(d);   break;
    // Style overlays
    case 'neon':         d && drawNeonOverlay(d); break;
    case 'cyberpunk':    d && drawCyberpunk(d);   break;
    case 'gold':         d && drawGold(d);        break;
    case 'cartoon':      d && drawCartoon(d);     break;
    case 'noir':         d && drawNoir(d);        break;
    case 'watercolor':   d && drawWatercolor(d);  break;
    case 'oil_paint':    d && drawOilPaint(d);    break;
    case 'night_vision': d && drawNightVision(d); break;
    case 'hologram':     d && drawHologram(d);    break;
    case 'infrared':     d && drawInfrared(d);    break;
  }
}
