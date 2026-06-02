/**
 * slimFaceFilter.ts
 * ------------------------------------------------------------------------------------------------
 * Makes the face look slimmer by PINCHING the cheeks and jawline inward toward the facial midline.
 *
 * Technique: the same radial-displacement engine as the chubby filter, but with NEGATIVE strength
 * and the push direction pointing INWARD (toward the anchor). The result is a smooth "liquify /
 * pinch" that narrows the lower face — the classic beautifying "slim face" effect.
 *
 *   const f = new SlimFaceFilter(video, canvas, { intensity: 0.5 });
 *   await f.init(); f.start();
 * ------------------------------------------------------------------------------------------------
 */

import { BaseFaceFilter, IDX, type Landmarks } from "./faceFilterBase";

// Cheek + jaw landmarks (left and right) we want to pull inward.
const SLIM_LANDMARKS = [
  // left contour
  234, 93, 132, 58, 172, 136, 150, 215, 138, 135,
  // right contour
  454, 323, 361, 288, 397, 365, 379, 435, 367, 364,
];

export class SlimFaceFilter extends BaseFaceFilter {
  protected buildControlPoints(lm: Landmarks): void {
    const anchor = lm[IDX.anchor];
    const iod = this.interocular(lm);
    const radius = iod * this.radiusScale * 1.1;

    let n = 0;
    for (const idx of SLIM_LANDMARKS) {
      const p = lm[idx];
      // Direction points INWARD (toward anchor) so pixels are pulled to the midline.
      let dx = anchor.x - p.x;
      let dy = anchor.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      dx /= len;
      dy /= len;
      const strength = this.intensity * iod * 0.4;
      this.setPoint(n++, p.x, p.y, dx, dy, radius, strength);
    }
    this.activeCount = n;
  }
}

export default SlimFaceFilter;
