import { EPSILON } from "../constants";

export function math_equals(a: number, b: number) {
    return Math.abs(a - b) < EPSILON;
}

export function math_get_max_pot(n: number, max: number): number {
    let i: number = max;
    while (n < i) {
        i = i >>> 1;
    }
    return i;
}

export function math_clamp(i: number, b: number, t: number): number {
    return i < b ? b : i > t ? t : i;
}
