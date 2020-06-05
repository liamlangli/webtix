import { EPSILON } from '../constants'; 

export function Equals(a:number, b:number) {
  return Math.abs(a - b) < EPSILON;
}

export function get_max_pot(n: number, max: number): number {
  let i: number = max;
  while (n < i) {
    i = i >>> 1;
  }
  return i;
}