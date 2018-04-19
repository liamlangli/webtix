import { Vector3 } from "../math/Vector3";
import { IndexFloatArray } from "../core/IndexArray";
import { Box3 } from "../math/Box3";
import { OBJData } from "../utils/OBJLoader";



export class Primitive{

    box = new Box3();

    constructor(objData: OBJData, public faceIndex: number) {
        // this.n0.set(vertices.get(origin + 0 ), vertices.get(origin + 1 ), vertices.get(origin + 2 ));
        // this.n1.set(vertices.get(origin + 3 ), vertices.get(origin + 4 ), vertices.get(origin + 5 ));
        // this.n2.set(vertices.get(origin + 6 ), vertices.get(origin + 7 ), vertices.get(origin + 8 ));
        // this.p0.set(vertices.get(origin + 9 ), vertices.get(origin + 10), vertices.get(origin + 11));
        // this.p1.set(vertices.get(origin + 12), vertices.get(origin + 13), vertices.get(origin + 14));
        // this.p2.set(vertices.get(origin + 15), vertices.get(origin + 16), vertices.get(origin + 17));

        // this.box.minV.x = Math.min(Math.min(this.p0.x, this.p1.x), this.p2.x);
		// this.box.minV.y = Math.min(Math.min(this.p0.y, this.p1.y), this.p2.y);
        // this.box.minV.z = Math.min(Math.min(this.p0.z, this.p1.z), this.p2.z);
        // this.box.maxV.x = Math.max(Math.max(this.p0.x, this.p1.x), this.p2.x);
        // this.box.maxV.y = Math.max(Math.max(this.p0.y, this.p1.y), this.p2.y);
        // this.box.maxV.z = Math.max(Math.max(this.p0.z, this.p1.z), this.p2.z);

        // this.box.computeCenter();

        const p0 = objData.vertices[objData.faces[faceIndex][0]];
        const p1 = objData.vertices[objData.faces[faceIndex][3]];
        const p2 = objData.vertices[objData.faces[faceIndex][6]];

        this.box.minV.x = Math.min(Math.min(p0[0], p1[0]), p2[0]);
		this.box.minV.y = Math.min(Math.min(p0[1], p1[1]), p2[1]);
        this.box.minV.z = Math.min(Math.min(p0[2], p1[2]), p2[2]);
        this.box.maxV.x = Math.max(Math.max(p0[0], p1[0]), p2[0]);
        this.box.maxV.y = Math.max(Math.max(p0[1], p1[1]), p2[1]);
        this.box.maxV.z = Math.max(Math.max(p0[2], p1[2]), p2[2]);

        this.box.computeCenter();
    }
}