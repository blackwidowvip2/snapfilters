/**
 * alienFaceFilter.ts
 * ------------------------------------------------------------------------------------------------
 * "Alien / Grey" head shape: a large domed forehead/cranium and a narrow, pointed chin — the
 * classic top-heavy alien silhouette.
 *
 * Technique (two complementary fields):
 *  1. A big BLOAT centered above the brow (forehead/skull) that magnifies and balloons the upper
 *     head outward and upward.
 *  2. A PINCH along the jaw + chin that pulls the lower face inward to a point.
 *
 * Both reuse the engine's default radial displacement model.
 *
 *   const f = new AlienFaceFilter(video, canvas, { intensity: 0.6 });
 *   await f.init(); f.start();
 * ------------------------------------------------------------------------------------------------
 */

import { BaseFaceFilter, IDX, type Landmarks } from "./faceFilterBase";

// Jaw/chin contour to pinch inward toward the chin point.
const JAW_LANDMARKS = [
  172, 136, 150, 149, 176, 148, 377, 400, 378, 379, 365, 397, 152,
];

export class AlienFaceFilter extends BaseFaceFilter {
  protected buildControlPoints(lm: Landmarks): void {
    const iod = this.interocular(lm);
    const forehead = lm[IDX.forehead];
    const chin = lm[IDX.chin];
    const noseTip = lm[IDX.noseTip];

    let n = 0;

    // --- Forehead / cranium dome ---
    // Place the bloat centre slightly ABOVE the forehead landmark so the skull balloons upward.
    const domeCx = forehead.x;
    const domeCy = forehead.y - iod * 0.6;
    // Direction points upward so the inverse warp lifts/expands the crown.
    this.setPoint(
      n++,
      domeCx,
      domeCy,
      0,
      -1,
      iod * 2.6 * this.radiusScale,
      this.intensity * iod * 0.55
    );
    // A second, wider centred magnification to widen the temples.
    this.setPoint(
      n++,
      forehead.x,
      forehead.y - iod * 0.2,
      0,
      0,
      iod * 2.2 * this.radiusScale,
      this.intensity * iod * 0.35
    );

    // --- Chin / jaw pinch toward the chin point ---
    const radius = iod * 1.1 * this.radiusScale;
    for (const idx of JAW_LANDMARKS) {
      const p = lm[idx];
      let dx = chin.x - p.x;
      let dy = chin.y - p.y;
      const len = Math.hypot(dx, dy) || 1;
      // Pinch toward chin point, with extra downward pull to elongate to a point.
      dx /= len;
      dy = dy / len + 0.4;
      this.setPoint(
        n++,
        p.x,
        p.y,
        dx,
        dy,
        radius,
        this.intensity * iod * 0.42
      );
      if (n >= 30) break;
    }

    // Slight magnification at the temples is handled above; keep nose stable as anchor reference.
    void noseTip;

    this.activeCount = n;
  }

  /**
   * Hybrid displacement: if a control point stores a direction (dir != 0) we treat it as a
   * directional pinch/push; if dir == (0,0) we treat it as a centered magnification (dome widening).
   */
  protected getDisplacementGLSL(): string {
    return `
      vec2 d = uv - c;
      d.x *= uAspect;
      float dist = length(d);
      float t = clamp(1.0 - dist / rad, 0.0, 1.0);
      float falloff = t * t * (3.0 - 2.0 * t);
      bool centered = (abs(dir.x) + abs(dir.y) < 0.0001);
      if (centered) {
        // centered magnification (balloon the region)
        disp += (c - uv) * (str * falloff * 2.0);
      } else {
        // directional push/pinch
        disp -= dir * (str * falloff);
      }
    `;
  }
}

export default AlienFaceFilter;
