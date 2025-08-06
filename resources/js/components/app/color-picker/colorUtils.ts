import { RgbColor, HsvColor, HslColor, OklchColor } from './color';

export const colorUtils = {
  hsvToRgb: (h: number, s: number, v: number): [number, number, number] => {
    const c = v * s;
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    const m = v - c;

    let r: number, g: number, b: number;

    if (h >= 0 && h < 60) {
      r = c; g = x; b = 0;
    } else if (h >= 60 && h < 120) {
      r = x; g = c; b = 0;
    } else if (h >= 120 && h < 180) {
      r = 0; g = c; b = x;
    } else if (h >= 180 && h < 240) {
      r = 0; g = x; b = c;
    } else if (h >= 240 && h < 300) {
      r = x; g = 0; b = c;
    } else {
      r = c; g = 0; b = x;
    }

    return [
      Math.round((r + m) * 255),
      Math.round((g + m) * 255),
      Math.round((b + m) * 255)
    ];
  },

  rgbToHsv: (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const diff = max - min;

    let h = 0;
    const s = max === 0 ? 0 : diff / max;
    const v = max;

    if (diff !== 0) {
      switch (max) {
        case r:
          h = ((g - b) / diff) % 6;
          break;
        case g:
          h = (b - r) / diff + 2;
          break;
        case b:
          h = (r - g) / diff + 4;
          break;
      }
      h *= 60;
    }

    if (h < 0) h += 360;

    return [h, s, v];
  },

  hexToRgb: (hex: string): [number, number, number] => {
    if (!hex || typeof hex !== 'string') return [0, 0, 0];

    // Limpia el string y convierte a minúsculas
    const cleanedHex = hex.trim().toLowerCase();

    // Maneja formatos abreviados (#abc -> #aabbcc)
    if (/^#?[0-9a-f]{3}$/.test(cleanedHex)) {
      const expanded = cleanedHex.replace(/^#?([0-9a-f])([0-9a-f])([0-9a-f])$/, '$1$1$2$2$3$3');
      return [
        parseInt(expanded.substring(0, 2), 16),
        parseInt(expanded.substring(2, 4), 16),
        parseInt(expanded.substring(4, 6), 16)
      ];
    }

    // Maneja formato completo
    const result = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(cleanedHex);
    return result ? [
      parseInt(result[1], 16),
      parseInt(result[2], 16),
      parseInt(result[3], 16)
    ] : [0, 0, 0];
  },
  isValidHex: (hex: string): boolean => {
    return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/i.test(hex);
  },

  rgbToHex: (r: number, g: number, b: number): string => {
    const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
    return "#" + [clamp(r), clamp(g), clamp(b)].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  },

  rgbToHsl: (r: number, g: number, b: number): [number, number, number] => {
    r /= 255;
    g /= 255;
    b /= 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h: number, s: number, l = (max + min) / 2;

    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
        default: h = 0;
      }
      h /= 6;
    }

    return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
  },

  hslToRgb: (h: number, s: number, l: number): [number, number, number] => {
    h /= 360;
    s /= 100;
    l /= 100;

    const hue2rgb = (p: number, q: number, t: number): number => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };

    let r: number, g: number, b: number;

    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1 / 3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1 / 3);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  },

  srgbToLinear: (c: number): number => {
    c = c / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  },

  linearToSrgb: (c: number): number => {
    const srgb = c <= 0.0031308 ? 12.92 * c : 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
    return Math.round(Math.max(0, Math.min(1, srgb)) * 255);
  },

  rgbToXyz: (r: number, g: number, b: number): [number, number, number] => {

    const rLin = colorUtils.srgbToLinear(r);
    const gLin = colorUtils.srgbToLinear(g);
    const bLin = colorUtils.srgbToLinear(b);

    const x = 0.4124564 * rLin + 0.3575761 * gLin + 0.1804375 * bLin;
    const y = 0.2126729 * rLin + 0.7151522 * gLin + 0.0721750 * bLin;
    const z = 0.0193339 * rLin + 0.1191920 * gLin + 0.9503041 * bLin;

    return [x, y, z];
  },

  xyzToRgb: (x: number, y: number, z: number): [number, number, number] => {

    const rLin = 3.2404542 * x - 1.5371385 * y - 0.4985314 * z;
    const gLin = -0.9692660 * x + 1.8760108 * y + 0.0415560 * z;
    const bLin = 0.0556434 * x - 0.2040259 * y + 1.0572252 * z;

    const r = colorUtils.linearToSrgb(rLin);
    const g = colorUtils.linearToSrgb(gLin);
    const b = colorUtils.linearToSrgb(bLin);

    return [r, g, b];
  },

  xyzToOklab: (x: number, y: number, z: number): [number, number, number] => {

    const l = 0.8189330101 * x + 0.3618667424 * y - 0.1288597137 * z;
    const m = 0.0329845436 * x + 0.9293118715 * y + 0.0361456387 * z;
    const s = 0.0482003018 * x + 0.2643662691 * y + 0.6338517070 * z;

    const lCbrt = Math.cbrt(l);
    const mCbrt = Math.cbrt(m);
    const sCbrt = Math.cbrt(s);

    const L = 0.2104542553 * lCbrt + 0.7936177850 * mCbrt - 0.0040720468 * sCbrt;
    const a = 1.9779984951 * lCbrt - 2.4285922050 * mCbrt + 0.4505937099 * sCbrt;
    const b = 0.0259040371 * lCbrt + 0.7827717662 * mCbrt - 0.8086757660 * sCbrt;

    return [L, a, b];
  },

  oklabToXyz: (L: number, a: number, b: number): [number, number, number] => {

    const l = L + 0.3963377774 * a + 0.2158037573 * b;
    const m = L - 0.1055613458 * a - 0.0638541728 * b;
    const s = L - 0.0894841775 * a - 1.2914855480 * b;

    const lCubed = l * l * l;
    const mCubed = m * m * m;
    const sCubed = s * s * s;

    const x = 1.2268798733 * lCubed - 0.5578149965 * mCubed + 0.2813910456 * sCubed;
    const y = -0.0405801784 * lCubed + 1.1122568696 * mCubed - 0.0716766787 * sCubed;
    const z = -0.0763812845 * lCubed - 0.4214819784 * mCubed + 1.5861632204 * sCubed;

    return [x, y, z];
  },

  oklabToOklch: (L: number, a: number, b: number): [number, number, number] => {
    const C = Math.sqrt(a * a + b * b);
    let H = Math.atan2(b, a) * 180 / Math.PI;
    if (H < 0) H += 360;

    return [L, C, H];
  },

  oklchToOklab: (L: number, C: number, H: number): [number, number, number] => {
    const hRad = H * Math.PI / 180;
    const a = C * Math.cos(hRad);
    const b = C * Math.sin(hRad);

    return [L, a, b];
  },

  rgbToOklch: (r: number, g: number, b: number): [number, number, number] => {
    const [x, y, z] = colorUtils.rgbToXyz(r, g, b);
    const [L, a, bLab] = colorUtils.xyzToOklab(x, y, z);
    const [lch_L, lch_C, lch_H] = colorUtils.oklabToOklch(L, a, bLab);

    return [
      Math.round(lch_L * 100 * 100) / 100,
      Math.round(lch_C * 100) / 100,
      Math.round(lch_H * 100) / 100
    ];
  },

  oklchToRgb: (l: number, c: number, h: number): [number, number, number] => {
    const L = l / 100;

    const [labL, a, b] = colorUtils.oklchToOklab(L, c, h);
    const [x, y, z] = colorUtils.oklabToXyz(labL, a, b);
    const [r, g, bRgb] = colorUtils.xyzToRgb(x, y, z);

    return [
      Math.max(0, Math.min(255, Math.round(r))),
      Math.max(0, Math.min(255, Math.round(g))),
      Math.max(0, Math.min(255, Math.round(bRgb)))
    ];
  }
};