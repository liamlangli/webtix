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

    envMap: HTMLCanvasElement;

    constructor( public accelerator: Accelerator) {}

    bindEnvironmentMap(map: HTMLCanvasElement) {
        this.envMap = map;
    }

    bindOBJPackage(objPack: OBJPackage) {
        this.accelerator.feed(objPack);
        this.faceCount = objPack.objData.faces.length;
        this.accelerator.build();
        console.log('BVH has been built');
        this.accelerateBuffer = new TextureBuffer(this.accelerator.genAccelerateBuffer(), AcceleratorBufferWidth);
        this.faceBuffer = new TextureBuffer(this.accelerator.genFaceBuffer(), FaceBufferWidth);
        this.vertexBuffer = new TextureBuffer(this.accelerator.genVertexBuffer(), VertexBufferWidth);
        this.normalBuffer = new TextureBuffer(this.accelerator.genNormalBuffer(), NormalBufferWidth);
        this.materialBuffer = new TextureBuffer(this.accelerator.genMaterialBuffer(), MaterialBufferWidth);
        console.log('Texture buffers generated.');
    }

}