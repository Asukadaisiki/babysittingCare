export const __esModule: boolean;
export default color;
export const darker: 0.7;
export const brighter: number;
export function Color(): void;
export function Rgb(r: any, g: any, b: any, opacity: any): void;
export class Rgb {
    constructor(r: any, g: any, b: any, opacity: any);
    r: number;
    g: number;
    b: number;
    opacity: number;
}
declare function color(format: any): Rgb | Hsl;
export function hsl(h: any, s: any, l: any, opacity: any, ...args: any[]): Hsl;
export function hslConvert(o: any): Hsl;
export function rgb(r: any, g: any, b: any, opacity: any, ...args: any[]): Rgb;
export function rgbConvert(o: any): Rgb;
declare function Hsl(h: any, s: any, l: any, opacity: any): void;
declare class Hsl {
    constructor(h: any, s: any, l: any, opacity: any);
    h: number;
    s: number;
    l: number;
    opacity: number;
}
