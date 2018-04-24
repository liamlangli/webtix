import { Vector3 } from "../math/Vector3";
import { IndexFloatArray } from "../core/IndexArray";
import { Box3 } from "../math/Box3";
import { OBJData } from "../loaders/OBJLoader";



export class Primitive{

    box = new Box3();

    constructor(objData: OBJData, public faceIndex: number) {
        
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