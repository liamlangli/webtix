import { Primitive } from "../geometry/Primitive";
import { Box3 } from "../math/Box3";
import { Vector3 } from "../math/Vector3";
import { Accelerator } from "./Accelerator";

class BVHNode {
    box: Box3;
    left: BVHNode;
    right: BVHNode;
}

export class BVH extends Accelerator {
    
    root: BVHNode;
    axis: number = 0;

    constructor() {
        super();
    }

    feed(vertices: Float32Array) {
        super.feed(vertices);
        this.build(vertices);
    }

    build(vertices: Float32Array) {
        let pivot = this.box.center.clone();
        // let split_point = this.split(vertices, pivot[this.axis], this.axis);
    }

    split() {
        let center = new Vector3(0, 0, 0);
        let tmpMin = new Vector3(0, 0, 0);
        let tmpBox = new Box3();
        let accBox = new Box3();
        return (vertices: Float32Array, pivot: number, axis:number):number => {
            let start = 0;
            let end = vertices.length - 1;
            let center: Vector3;
            while(start < end) {
                // tmpBox();
            }
            return 0;
        }
        
    }

}