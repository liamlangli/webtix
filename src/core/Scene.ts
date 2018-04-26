import { Accelerator } from "../accelerator/Accelerator";
import { OBJData, OBJPackage } from "../loaders/OBJLoader";
import { IndexFloatArray } from "./IndexArray";
import { TextureBuffer, AcceleratorBufferWidth, PrimitiveBufferWidth, FaceBufferWidth, VertexBufferWidth, NormalBufferWidth, MaterialBufferWidth } from "./TextureBuffer";

export class Scene {
    
    faceCount: number;
    accelerateBuffer: TextureBuffer;
    faceBuffer: TextureBuffer;
    vertexBuffer: TextureBuffer;
    normalBuffer: TextureBuffer;
    materialBuffer: TextureBuffer;

    primitiveBuffer: TextureBuffer;         //deprecated

    constructor(objPack: OBJPackage, public accelerator: Accelerator) {
        accelerator.feed(objPack);
        this.faceCount = objPack.objData.faces.length;
        accelerator.build();
        console.log('BVH has been built');
        this.accelerateBuffer = new TextureBuffer(accelerator.genAccelerateBuffer(), AcceleratorBufferWidth);
        this.faceBuffer = new TextureBuffer(accelerator.genFaceBuffer(), FaceBufferWidth);
        this.vertexBuffer = new TextureBuffer(accelerator.genVertexBuffer(), VertexBufferWidth);
        this.normalBuffer = new TextureBuffer(accelerator.genNormalBuffer(), NormalBufferWidth);
        this.materialBuffer = new TextureBuffer(accelerator.genMaterialBuffer(), MaterialBufferWidth);
        console.log('Texture buffers generated.');
    }

}