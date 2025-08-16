export interface RgbColor {
    r: number;
    g: number;
    b: number;
}

export interface HsvColor {
    h: number;
    s: number;
    v: number;
}

export interface HslColor {
    h: number;
    s: number;
    l: number;
}

export interface OklchColor {
    l: number;
    c: number;
    h: number;
}

export interface ColorComponent {
    label: string;
    value: number | string;
    unit: string;
}

export type ColorFormat = 'HEX' | 'HSL' | 'OKLCH' | 'RGB';