import { Vector3 } from "../math/Vector3";

export class Primitive{
    constructor(public vertices: number[]) {   
    }
}

export class TrianglePrimitive extends Primitive{
    constructor(public vertices: number[]) {
        super(vertices);   
    }
}