import { Vector3 } from "../math/Vector3";
import { IndexFloatArray } from "../core/IndexArray";
import { Box3 } from "../math/Box3";



export class Primitive{

    box = new Box3();
    n0 = new Vector3(0, 0, 0);
    n1 = new Vector3(0, 0, 0);
    n2 = new Vector3(0, 0, 0);
    p0 = new Vector3(0, 0, 0);
    p1 = new Vector3(0, 0, 0);
    p2 = new Vector3(0, 0, 0);

    constructor(public vertices: IndexFloatArray, origin:number) {
        this.n0.set(vertices.get(origin + 0 ), vertices.get(origin + 1 ), vertices.get(origin + 2 ));
        this.n1.set(vertices.get(origin + 3 ), vertices.get(origin + 4 ), vertices.get(origin + 5 ));
        this.n2.set(vertices.get(origin + 6 ), vertices.get(origin + 7 ), vertices.get(origin + 8 ));
        this.p0.set(vertices.get(origin + 9 ), vertices.get(origin + 10), vertices.get(origin + 11));
        this.p1.set(vertices.get(origin + 12), vertices.get(origin + 13), vertices.get(origin + 14));
        this.p2.set(vertices.get(origin + 15), vertices.get(origin + 16), vertices.get(origin + 17));

        this.box.minV.x = Math.min(Math.min(this.p0.x, this.p1.x), this.p2.x);
		this.box.minV.y = Math.min(Math.min(this.p0.y, this.p1.y), this.p2.y);
        this.box.minV.z = Math.min(Math.min(this.p0.z, this.p1.z), this.p2.z);
        this.box.maxV.x = Math.max(Math.max(this.p0.x, this.p1.x), this.p2.x);
        this.box.maxV.y = Math.max(Math.max(this.p0.y, this.p1.y), this.p2.y);
        this.box.maxV.z = Math.max(Math.max(this.p0.z, this.p1.z), this.p2.z);

        this.box.computeCenter();
    }
}