/**
 * axes align bounding box
 */

import { Point3, Vector3 } from "./vector3";
import { BufferArray } from "../types";

export class Box3 {
    public min: Point3 = new Vector3(Infinity, Infinity, Infinity);
    public max: Point3 = new Vector3(-Infinity, -Infinity, -Infinity);

    private _center: Point3 = new Vector3(0, 0, 0);
    public get center(): Point3 {
        return this._center
            .copy(this.max)
            .sub(this.min)
            .mult(0.5)
            .add(this.min);
    }

    private _size: Vector3 = new Vector3(0, 0, 0);
    public get size(): Vector3 {
        return this._size.copy(this.max).sub(this.min);
    }

    constructor(min?: Point3, max?: Point3) {
        if (min !== undefined) {
            this.min.copy(min);
        }
        if (max !== undefined) {
            this.max.copy(max);
        }
    }

    reset(): Box3 {
        this.min.set(Infinity, Infinity, Infinity);
        this.max.set(-Infinity, -Infinity, -Infinity);
        return this;
    }

    expandByBox3(b: Box3): Box3 {
        this.min.min(b.min);
        this.max.max(b.max);
        return this;
    }

    expandByPoint3(v: Point3): Box3 {
        this.min.min(v);
        this.max.max(v);
        return this;
    }

    clone(): Box3 {
        return new Box3(this.min, this.max);
    }

    read(buffer: BufferArray, offset: number = 0): Box3 {
        this.min.read(buffer, offset);
        this.max.read(buffer, offset + 3);
        this._center.read(buffer, offset + 6);
        return this;
    }

    write(buffer: BufferArray, offset: number = 0): Box3 {
        this.min.write(buffer, offset);
        this.max.write(buffer, offset + 3);
        this.center.write(buffer, offset + 6);
        return this;
    }
}
