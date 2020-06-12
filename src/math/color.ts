export class Color3 {

  constructor(public R?: number, public G?: number, public B?: number) {
    this.R = R !== undefined ? R : 0.0;
    this.G = G !== undefined ? G : 0.0;
    this.B = B !== undefined ? B : 0.0;
  }

  set(R: number, G: number, B: number): Color3 {
    this.R = R;
    this.G = G;
    this.B = B;
    return this;
  }
}