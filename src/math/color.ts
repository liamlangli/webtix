export class Color3 {
    R: number;
    G: number;
    B: number;

    constructor(R?: number, G?: number, B?: number) {
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

export class Color4 {
    R: number;
    G: number;
    B: number;
    A: number;

    constructor(R?: number, G?: number, B?: number, A?: number) {
        this.R = R !== undefined ? R : 0.0;
        this.G = G !== undefined ? G : 0.0;
        this.B = B !== undefined ? B : 0.0;
        this.A = A !== undefined ? A : 0.0;
    }

    set(R: number, G: number, B: number, A: number): Color4 {
        this.R = R;
        this.G = G;
        this.B = B;
        this.A = A;
        return this;
    }
}
