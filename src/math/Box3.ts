/**
 * axes align bounding box
 */

import { Vector3 } from "./Vector3";

export class Box3 {

    public center: Vector3;

    constructor(public min: Vector3, public max: Vector3) {
        this.center = min.clone().mult(0.5).add(max.clone().mult(0.5));
    }

}