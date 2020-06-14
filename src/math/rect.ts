import { Vector2 } from './vector2';

export class Rect {

  origin: Vector2;
  size: Vector2;

  constructor(x: number, y: number, w: number, h: number) {
    this.origin = new Vector2(x, y);
    this.size = new Vector2(w, h);
  }

  width(): number {
    return this.size.x;
  }

  height(): number {
    return this.size.y;
  }

  translate(x: number, y: number): Rect {
    this.origin.x += x;
    this.origin.y += y;
    return this;
  }

  scale(x: number, y: number): Rect {
    this.size.x *= x;
    this.size.y *= y;
    return this;
  }

}