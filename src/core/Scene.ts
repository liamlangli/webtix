import { Accelerator } from "../accelerator/Accelerator";
import { OBJData } from "../utils/OBJLoader";
import { IndexFloatArray } from "./IndexArray";
import { TextureBuffer } from "./TextureBuffer";

export class Scene {
    
    accelerateBuffer: TextureBuffer;
    primitiveBuffer: TextureBuffer;

    constructor(public originData: Float32Array , public accelerator: Accelerator) {
        accelerator.feed(originData);
        accelerator.build();
        this.accelerateBuffer = new TextureBuffer(accelerator.genAccelerateBuffer());
        this.primitiveBuffer = new TextureBuffer(accelerator.genPrimitiveBuffer());
    }

}