import { Accelerator } from "../accelerator/Accelerator";
import { OBJData } from "../utils/OBJLoader";
import { IndexFloatArray } from "./IndexArray";
import { TextureBuffer } from "./TextureBuffer";

export class Scene {
    
    accelerateBuffer: TextureBuffer;

    constructor(public primitiveBuffer: TextureBuffer, public accelerator: Accelerator) {
        accelerator.feed(primitiveBuffer.data);
        accelerator.build();
        this.accelerateBuffer = new TextureBuffer(accelerator.genBuffer());
    }

}