import { Accelerator } from "../accelerator/Accelerator";
import { OBJData } from "../utils/OBJLoader";
import { IndexFloatArray } from "./IndexArray";
import { TextureBuffer, AcceleratorBufferWidth, PrimitiveBufferWidth, FaceBufferWidth, VertexBufferWidth, NormalBufferWidth } from "./TextureBuffer";

export class Scene {
    
    faceCount: number;
    accelerateBuffer: TextureBuffer;
    faceBuffer: TextureBuffer;
    vertexBuffer: TextureBuffer;
    normalBuffer: TextureBuffer;

    primitiveBuffer: TextureBuffer;         //deprecated

    constructor(objData: OBJData , public accelerator: Accelerator) {
        accelerator.feed(objData);
        this.faceCount = objData.faces.length;
        accelerator.build();
        console.log('BVH has been built');
        this.accelerateBuffer = new TextureBuffer(accelerator.genAccelerateBuffer(), AcceleratorBufferWidth);
        this.faceBuffer = new TextureBuffer(accelerator.genFaceBuffer(), FaceBufferWidth);
        this.vertexBuffer = new TextureBuffer(accelerator.genVertexBuffer(), VertexBufferWidth);
        this.normalBuffer = new TextureBuffer(accelerator.genNormalBuffer(), NormalBufferWidth);
        console.log('Texture buffers generated.');
    }

}