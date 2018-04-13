import { Primitive } from '../geometry/Primitive';
import { Box3 } from '../math/Box3';
import { Vector3 } from '../math/Vector3';
import { Accelerator, longestAxis } from './Accelerator';
import { IndexArray } from '../core/IndexArray';

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
        this.build(new IndexArray(vertices), 0, vertices.length);
    }

    build(vertices: IndexArray, left: number, right: number) {
        let pivot = this.box.center.clone();
        this.axis = longestAxis(this.box);
        this.root = new BVHNode();
        this.root.box = this.box.clone();
        this.split(this.pList, left, right, pivot, this.axis);
    }

    split(primitives: Primitive[], left: number, right: number, pivot: Vector3, axis: number) {
        for(let front = left, back = right - 1; front < right; ++front) {
            const pFront = this.pList[front];
            const pBack = this.pList[back];
            while (front < right) {
                if (pFront.box.center.elements()[axis] < pivot.elements()[axis]) {
                    ++front;
                    --back;
                }
            }
        }
    }

}