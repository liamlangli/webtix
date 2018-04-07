export class Vector3 {

    constructor(public x: number, public y: number, public z: number) {}

    add(v: Vector3):Vector3 {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    sub(v: Vector3):Vector3 {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    mult(scalar: number) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    dot(v: Vector3):number {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    mag():number {
        return this.x * this.x + this.y * this.y;
    }

    len():number {
        return Math.sqrt(this.mag());
    }

    normalize():Vector3 {
        return this.mult(1.0 / this.len());
    }

    cross(v: Vector3):Vector3 {
        return new Vector3(this.y * v.z - this.z * v.y, this.x * v.z - this.z * v.x, this.x * v.y - this.y * v.x);
    }

    set(x: number, y: number, z: number):Vector3 {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    copy(v: Vector3):Vector3 {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    clone():Vector3 {
        return new Vector3(this.x, this.y, this.z);
    }
}

type Point3 = Vector3;