import { EPSILON } from '../constants'; 

export function Equals(a:number, b:number) {
  return Math.abs(a - b) < EPSILON;
}