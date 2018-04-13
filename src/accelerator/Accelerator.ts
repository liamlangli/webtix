import { Box3 } from "../math/Box3";
import { Primitive } from "../geometry/Primitive";
import { IndexFloatArray } from "../core/IndexArray";
import { Equals } from "../utils/MathUtil";

export function longestAxis(box: Box3): number {
    let lenV = box.maxV.clone().sub(box.minV);
    let max = lenV.maxElement();
    if (Equals(max, lenV.x)) {
        return 0;
    } else if (Equals(max, lenV.y)){
        return 1;
    } else {
        return 2;
    }
}

export class Accelerator {

    box: Box3;
    pList: Primitive[] = [];

    constructor() {
        this.box = new Box3();
    }

    feed(vertices: Float32Array) {
        const arr = new IndexFloatArray(vertices);
        for(let i = 0, il = vertices.length; i < il; i+=12) {
            const p = new Primitive(arr, i);
            this.box.append(p.box);
            this.pList.push(p);
        }
    }

}