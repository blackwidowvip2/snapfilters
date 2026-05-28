import { DrawCtx } from './DrawCtx';
import { pxNeon, pxGlitch, pxThermal, pxZombie, pxVampire, pxCyberpunk } from './pixelFilters';
import { drawDog } from './animal/dog';
import { drawCat } from './animal/cat';
import { drawBunny } from './animal/bunny';
import { drawFox } from './animal/fox';
import { drawLion } from './animal/lion';
import { drawLipRed, drawLipPink, drawEyeshadowSmoky, drawEyeshadowGlam, drawFullGlam } from './makeup/index';
import { drawVampire, drawZombie, drawDevil, drawAngel, drawAlien } from './character/index';
import { drawNeonOverlay, drawCyberpunk, drawGold } from './style/index';
import type { LandmarkList } from '../types';

// Filters that skip pixel processing
const NO_PIXEL_FILTERS = new Set([
  'none','dog','cat','bunny','fox','lion',
  'lip_red','lip_pink','eyeshadow_smoky','eyeshadow_glam','full_glam',
  'vampire_overlay','devil','angel','alien',
  'gold',
]);

export function applyPixelFilter(
  ctx: CanvasRenderingContext2D,
  filterId: string,
  W: number,
  H: number,
  t: number,
) {
  if (NO_PIXEL_FILTERS.has(filterId)) return;
  try {
    const id = ctx.getImageData(0, 0, W, H);
    let out: ImageData | null = null;
    if (filterId === 'neon')      out = pxNeon(id.data, W, H, t);
    if (filterId === 'glitch')    out = pxGlitch(id.data, W, H, t);
    if (filterId === 'thermal')   out = pxThermal(id.data, W, H);
    if (filterId === 'zombie')    out = pxZombie(id.data, W, H);
    if (filterId === 'vampire')   out = pxVampire(id.data, W, H);
    if (filterId === 'cyberpunk') out = pxCyberpunk(id.data, W, H);
    if (out) ctx.putImageData(out, 0, 0);
  } catch (_) { /* silent */ }
}

export function applyOverlayFilter(
  ctx: CanvasRenderingContext2D,
  filterId: string,
  landmarks: LandmarkList | null,
  W: number,
  H: number,
  t: number,
) {
  if (filterId === 'none' || !landmarks) return;
  const d = new DrawCtx(ctx, landmarks, W, H, t);

  switch (filterId) {
    // Animal
    case 'dog':    drawDog(d);    break;
    case 'cat':    drawCat(d);    break;
    case 'bunny':  drawBunny(d);  break;
    case 'fox':    drawFox(d);    break;
    case 'lion':   drawLion(d);   break;
    // Makeup
    case 'lip_red':          drawLipRed(d);          break;
    case 'lip_pink':         drawLipPink(d);          break;
    case 'eyeshadow_smoky':  drawEyeshadowSmoky(d);  break;
    case 'eyeshadow_glam':   drawEyeshadowGlam(d);   break;
    case 'full_glam':        drawFullGlam(d);         break;
    // Character
    case 'vampire':  drawVampire(d); break;
    case 'zombie':   drawZombie(d);  break;
    case 'devil':    drawDevil(d);   break;
    case 'angel':    drawAngel(d);   break;
    case 'alien':    drawAlien(d);   break;
    // Style overlays
    case 'neon':      drawNeonOverlay(d); break;
    case 'cyberpunk': drawCyberpunk(d);   break;
    case 'gold':      drawGold(d);        break;
    // Effect-only (glitch, thermal) — pixel filter does the work
    default: break;
  }
}
