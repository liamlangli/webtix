import { EPSILON } from '../Constants'; 

export function Equals(a:number, b:number) {
    return Math.abs(a - b) < EPSILON;
}