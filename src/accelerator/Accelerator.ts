import { Box3 } from "../math/Box3";

export class Accelerator {

    box: Box3;

    constructor() {
        this.box = new Box3();
    }

    feed(vertices: Float32Array) {
        for(let i = 0, il = vertices.length; i < il; i+=12) {
            const b = new Box3();
            b.minV.x = Math.min(Math.min(vertices[i + 0], vertices[i + 3]), vertices[i + 6]);
		    b.minV.y = Math.min(Math.min(vertices[i + 1], vertices[i + 4]), vertices[i + 7]);
            b.minV.z = Math.min(Math.min(vertices[i + 2], vertices[i + 5]), vertices[i + 8]);
            b.maxV.x = Math.max(Math.max(vertices[i + 0], vertices[i + 3]), vertices[i + 6]);
		    b.maxV.y = Math.max(Math.max(vertices[i + 1], vertices[i + 4]), vertices[i + 7]);
            b.maxV.z = Math.max(Math.max(vertices[i + 2], vertices[i + 5]), vertices[i + 8]);
            this.box.append(b);
        }
    }

}