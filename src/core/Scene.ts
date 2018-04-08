import { Accelerator } from "../accelerator/Accelerator";

export class Scene {

    constructor(public vertices: Float32Array, public accelerator: Accelerator) {
        accelerator.feed(vertices);
    }

}