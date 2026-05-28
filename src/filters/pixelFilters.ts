function lum(r: number, g: number, b: number) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}
function clamp(v: number) {
  return v < 0 ? 0 : v > 255 ? 255 : v;
}

export function pxNeon(src: Uint8ClampedArray, W: number, H: number, t: number): ImageData {
  const out = new Uint8ClampedArray(src.length);
  const hsl2rgb = (h: number, s: number, l: number) => {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1; if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    return [hue2rgb(p, q, h + 1/3) * 255, hue2rgb(p, q, h) * 255, hue2rgb(p, q, h - 1/3) * 255];
  };
  for (let y = 1; y < H - 1; y++) {
    for (let x = 1; x < W - 1; x++) {
      const i = (y * W + x) * 4;
      const gx = src[(y * W + x + 1) * 4] - src[(y * W + x - 1) * 4];
      const gy = src[((y + 1) * W + x) * 4] - src[((y - 1) * W + x) * 4];
      const mag = Math.min(Math.sqrt(gx * gx + gy * gy) / 50, 1);
      if (mag > 0.1) {
        const angle = Math.atan2(gy, gx);
        const hue = (((angle / Math.PI + 1) / 2) + t * 0.1) % 1;
        const rgb = hsl2rgb(hue, 1, 0.55);
        const g2 = mag * 4;
        out[i]   = clamp(src[i]   * 0.08 + rgb[0] * g2);
        out[i+1] = clamp(src[i+1] * 0.08 + rgb[1] * g2);
        out[i+2] = clamp(src[i+2] * 0.08 + rgb[2] * g2);
      } else {
        out[i]   = src[i]   * 0.08;
        out[i+1] = src[i+1] * 0.08;
        out[i+2] = src[i+2] * 0.08;
      }
      out[i+3] = 255;
    }
  }
  return new ImageData(out, W, H);
}

export function pxGlitch(src: Uint8ClampedArray, W: number, H: number, t: number): ImageData {
  const out = new Uint8ClampedArray(src.length);
  const pseudo = (n: number) => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
  const seed = Math.floor(t * 8);
  const slices = Array.from({ length: 12 }, (_, s) => ({
    y:  (pseudo(seed * 17 + s * 7) * H) | 0,
    sh: ((pseudo(seed * 3 + s * 13) - 0.5) * 80) | 0,
    h:  (pseudo(seed * 5 + s) * 28 + 3) | 0,
  }));
  for (let y = 0; y < H; y++) {
    let rs = 0;
    for (const sl of slices) {
      if (y >= sl.y && y < sl.y + sl.h) { rs = sl.sh; break; }
    }
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      const xR = Math.min(Math.max(x + rs + 16, 0), W - 1);
      const xG = Math.min(Math.max(x + rs, 0), W - 1);
      const xB = Math.min(Math.max(x + rs - 16, 0), W - 1);
      out[i]   = src[(y * W + xR) * 4];
      out[i+1] = src[(y * W + xG) * 4 + 1];
      out[i+2] = src[(y * W + xB) * 4 + 2];
      if (y % 3 === 0) { out[i] *= 0.6; out[i+1] *= 0.6; out[i+2] *= 0.6; }
      if (pseudo(x * 1.3 + y * 0.7 + t * 99) > 0.998) out[i] = out[i+1] = out[i+2] = 255;
      out[i+3] = 255;
    }
  }
  return new ImageData(out, W, H);
}

export function pxThermal(src: Uint8ClampedArray, W: number, H: number): ImageData {
  const pal   = [[0,0,0],[32,0,96],[192,0,0],[255,128,0],[255,255,0],[255,255,255]];
  const stops = [0, 0.2, 0.45, 0.7, 0.88, 1.0];
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const v = Math.pow(lum(src[i], src[i+1], src[i+2]) / 255, 0.8);
    let c = pal[pal.length - 1];
    for (let k = 1; k < stops.length; k++) {
      if (v <= stops[k]) {
        const tt = (v - stops[k-1]) / (stops[k] - stops[k-1]);
        const a = pal[k-1], b = pal[k];
        c = [a[0]+(b[0]-a[0])*tt, a[1]+(b[1]-a[1])*tt, a[2]+(b[2]-a[2])*tt];
        break;
      }
    }
    out[i]=c[0]; out[i+1]=c[1]; out[i+2]=c[2]; out[i+3]=255;
  }
  return new ImageData(out, W, H);
}

export function pxZombie(src: Uint8ClampedArray, W: number, H: number): ImageData {
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const l = lum(src[i], src[i+1], src[i+2]);
    out[i]   = clamp(l * 0.45 + src[i]   * 0.12 + 8);
    out[i+1] = clamp(l * 0.72 + src[i+1] * 0.35);
    out[i+2] = clamp(l * 0.28 + src[i+2] * 0.06);
    out[i+3] = 255;
  }
  return new ImageData(out, W, H);
}

export function pxVampire(src: Uint8ClampedArray, W: number, H: number): ImageData {
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const l = lum(src[i], src[i+1], src[i+2]);
    // Pale desaturated + very slight blue tint
    out[i]   = clamp(l * 0.55 + src[i]   * 0.52 + 18);
    out[i+1] = clamp(l * 0.52 + src[i+1] * 0.48 + 12);
    out[i+2] = clamp(l * 0.58 + src[i+2] * 0.55 + 28);
    out[i+3] = 255;
  }
  return new ImageData(out, W, H);
}

export function pxCyberpunk(src: Uint8ClampedArray, W: number, H: number): ImageData {
  const out = new Uint8ClampedArray(src.length);
  for (let i = 0; i < src.length; i += 4) {
    const l = lum(src[i], src[i+1], src[i+2]);
    const boost = l > 128 ? 1 : 0;
    out[i]   = clamp(src[i]   * 0.68 + boost * src[i]   * 0.35 + 6);
    out[i+1] = clamp(src[i+1] * 0.72 + src[i+1] * 0.06 + 14);
    out[i+2] = clamp(src[i+2] * 0.88 + (1 - boost) * 32 + 20);
    out[i+3] = 255;
  }
  return new ImageData(out, W, H);
}
