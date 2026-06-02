/**
 * swirlFaceFilter.ts
 * ------------------------------------------------------------------------------------------------
 * A funhouse "vortex" that swirls the centre of the face around the nose — pixels are rotated by an
 * angle that decreases with distance from the centre, producing a smooth spiral twist.
 *
 * Technique: this is NOT a radial push, so we override the displacement model. Each control point
 * encodes:
 *   c       = swirl centre (nose tip)
 *   dir.x   = max rotation angle in radians (signed; sign = direction of spin)
 *   radius  = swirl extent
 *   str     = unused (angle carried in dir.x), kept for compatibility
 *
 * For each pixel within the radius we rotate the sample coordinate about the centre by
 *   angle = maxAngle * smoothstep_falloff(dist)
 * which gives the classic twisted-vortex look while leaving the rest of the frame untouched.
 *
 *   const f = new SwirlFaceFilter(video, canvas, { intensity: 0.7 });
 *   await f.init(); f.start();
 *
 * Set `clockwise: false` in options-like fashion via setSpin().
 * ------------------------------------------------------------------------------------------------
 */

import {
  BaseFaceFilter,
  IDX,
  type Landmarks,
  type BaseFilterOptions,
} from "./faceFilterBase";

export class SwirlFaceFilter extends BaseFaceFilter {
  private spin = 1; // +1 clockwise, -1 counter-clockwise

  constructor(
    video: HTMLVideoElement,
    canvas: HTMLCanvasElement,
    o: BaseFilterOptions = {}
  ) {
    super(video, canvas, o);
  }

  setSpin(clockwise: boolean): void {
    this.spin = clockwise ? 1 : -1;
  }

  protected buildControlPoints(lm: Landmarks): void {
    const iod = this.interocular(lm);
    const centre = lm[IDX.noseTip];

    // Max rotation up to ~150° at full intensity.
    const maxAngle = this.spin * this.intensity * 2.6; // radians
    const radius = iod * 3.0 * this.radiusScale;

    // dir.x carries the angle; dir.y unused.
    this.setPoint(0, centre.x, centre.y, maxAngle, 0, radius, 0);
    this.activeCount = 1;
  }

  protected getDisplacementGLSL(): string {
    return `
      // Vector from swirl centre to pixel (aspect-correct for circular swirl).
      vec2 d = uv - c;
      d.x *= uAspect;
      float dist = length(d);
      float t = clamp(1.0 - dist / rad, 0.0, 1.0);
      float falloff = t * t * (3.0 - 2.0 * t);
      float angle = dir.x * falloff;
      float s = sin(angle);
      float co = cos(angle);
      // Rotate d, then convert back from aspect space.
      vec2 rotated = vec2(d.x * co - d.y * s, d.x * s + d.y * co);
      rotated.x /= uAspect;
      vec2 srcOffset = rotated - (d * vec2(1.0 / uAspect, 1.0));
      // disp is added to uv to get sample coord; we want sample at centre + rotated.
      disp += srcOffset;
    `;
  }
}

export default SwirlFaceFilter;
