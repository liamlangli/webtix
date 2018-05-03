export class Vector2 {

    constructor(public x?: number, public y?: number) {
        this.x = x !== undefined ? x : 0;
        this.y = y !== undefined ? y : 0;
    }

    min(v: Vector2):Vector2 {
        this.x = Math.min(this.x, v.x);
        this.y = Math.min(this.y, v.y);
        return this;
    }

    max(v: Vector2):Vector2 {
        this.x = Math.max(this.x, v.x);
        this.y = Math.max(this.y, v.y);
        return this;
    }

    add(v: Vector2):Vector2 {
        this.x += v.x;
        this.y += v.y;
        return this;
    }

    sub(v: Vector2):Vector2 {
        this.x -= v.x;
        this.y -= v.y;
        return this;
    }

    mult(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        return this;
    }

    dot(v: Vector2):number {
        return this.x * v.x + this.y * v.y;
    }

    mag():number {
        return this.x * this.x + this.y * this.y;
    }

    len():number {
        return Math.sqrt(this.mag());
    }

    normalize():Vector2 {
        return this.mult(1.0 / this.len());
    }

    set(x: number, y: number, z: number):Vector2 {
        this.x = x;
        this.y = y;
        return this;
    }

    copy(v: Vector2):Vector2 {
        this.x = v.x;
        this.y = v.y;
        return this;
    }

    clone():Vector2 {
        return new Vector2(this.x, this.y);
    }

    minElement():number {
        return Math.min(this.x, this.y);
    }

    maxElement():number {
        return Math.max(this.x, this.y);
    }

    elements():Float32Array {
        return new Float32Array([this.x, this.y]);
    }
}

type Point3 = Vector2;