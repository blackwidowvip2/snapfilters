/**
 * bigEyesFilter.ts
 * ------------------------------------------------------------------------------------------------
 * Enlarges both eyes for a cute / anime "big eyes" look.
 *
 * Technique: a localized BLOAT centered on each eye. We center a control point on each eye (using
 * the iris landmark when available, otherwise the midpoint of the eye corners) and size the radius
 * to the measured eye width so it scales correctly with distance from camera and head size.
 *
 * The default engine displacement (radial bloat) is exactly what's needed here — positive strength
 * with direction = unit vector that, when inverted, magnifies the region.
 *
 *   const f = new BigEyesFilter(video, canvas, { intensity: 0.6 });
 *   await f.init(); f.start();
 * ------------------------------------------------------------------------------------------------
 */

import { BaseFaceFilter, IDX, type Landmarks } from "./faceFilterBase";

export class BigEyesFilter extends BaseFaceFilter {
  protected buildControlPoints(lm: Landmarks): void {
    const iod = this.interocular(lm);

    // Eye centres: prefer iris landmarks (refineLandmarks); fall back to corner midpoints.
    const left = this.eyeCenter(
      lm,
      IDX.leftEyeOuter,
      IDX.leftEyeInner,
      IDX.leftIris
    );
    const right = this.eyeCenter(
      lm,
      IDX.rightEyeOuter,
      IDX.rightEyeInner,
      IDX.rightIris
    );

    // Eye width drives the radius so the bloat hugs the eye region.
    const leftW = Math.hypot(
      lm[IDX.leftEyeOuter].x - lm[IDX.leftEyeInner].x,
      lm[IDX.leftEyeOuter].y - lm[IDX.leftEyeInner].y
    );
    const rightW = Math.hypot(
      lm[IDX.rightEyeOuter].x - lm[IDX.rightEyeInner].x,
      lm[IDX.rightEyeOuter].y - lm[IDX.rightEyeInner].y
    );

    const strength = this.intensity * iod * 0.5;

    // Direction is the outward unit normal of the local bloat; for a symmetric magnification we use
    // a radial field, so direction is unused per-axis — we encode magnitude via strength and let the
    // shader pull radially. To get a true centered magnification we point dir away from centre,
    // which the inverse warp turns into "zoom in" around the eye.
    this.setPoint(
      0,
      left.x,
      left.y,
      0, // dir unused for centered bloat; shader uses radial vector
      0,
      leftW * 1.9 * this.radiusScale,
      strength
    );
    this.setPoint(
      1,
      right.x,
      right.y,
      0,
      0,
      rightW * 1.9 * this.radiusScale,
      strength
    );
    this.activeCount = 2;
  }

  /**
   * Override displacement: a true centered magnification (zoom) around the control point,
   * independent of a stored direction. Pulls each pixel toward the centre proportionally,
   * which makes the eye appear larger.
   */
  protected getDisplacementGLSL(): string {
    return `
      vec2 d = uv - c;
      d.x *= uAspect;
      float dist = length(d);
      float t = clamp(1.0 - dist / rad, 0.0, 1.0);
      float falloff = t * t * (3.0 - 2.0 * t);
      // Pull pixel toward the eye centre => magnification. Undo aspect on x.
      vec2 toward = (c - uv);
      disp += toward * (str * falloff * 2.5);
    `;
  }

  private eyeCenter(
    lm: Landmarks,
    outer: number,
    inner: number,
    iris: number
  ): { x: number; y: number } {
    const irisPt = lm[iris];
    if (irisPt) return { x: irisPt.x, y: irisPt.y };
    return {
      x: (lm[outer].x + lm[inner].x) / 2,
      y: (lm[outer].y + lm[inner].y) / 2,
    };
  }
}

export default BigEyesFilter;
