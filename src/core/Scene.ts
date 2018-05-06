import { Accelerator } from "../accelerator/Accelerator";
import { OBJData, OBJPackage } from "../loaders/OBJLoader";
import { IndexFloatArray } from "./IndexArray";
import { TextureBuffer, AcceleratorBufferWidth, PrimitiveBufferWidth, FaceBufferWidth, VertexBufferWidth, NormalBufferWidth, MaterialBufferWidth } from "./TextureBuffer";
import { BlobReader } from "../utils/BlobReader";

const JSZip = require('jszip');
const FileSaver = require('file-saver');

const BlobType = { type: "application/octet-binary" };

export class Scene {
    objPack: OBJPackage;
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
        this.objPack = objPack;
        this.accelerator.feed(objPack);
        this.faceCount = objPack.objData.faces.length;
        this.accelerator.build();
        this.accelerateBuffer = new TextureBuffer(this.accelerator.genAccelerateBuffer(), AcceleratorBufferWidth);
        this.faceBuffer = new TextureBuffer(this.accelerator.genFaceBuffer(), FaceBufferWidth);
        this.vertexBuffer = new TextureBuffer(this.accelerator.genVertexBuffer(), VertexBufferWidth);
        this.normalBuffer = new TextureBuffer(this.accelerator.genNormalBuffer(), NormalBufferWidth);
        this.materialBuffer = new TextureBuffer(this.accelerator.genMaterialBuffer(), MaterialBufferWidth);
    }

    async exportScenePackage(name: string) {
        if (!(this.faceBuffer && this.vertexBuffer && this.normalBuffer && this.materialBuffer && this.accelerateBuffer)) {
            throw 'scene buffer wasn\'t complete';
        }

        const sceneInfo = {
            faceCount: this.faceCount
        };

        const zip = new JSZip();
        zip.file('scene.json', JSON.stringify(sceneInfo));

        zip.file('acc.buffer', new Blob([new Float32Array(this.accelerator.genAccelerateBuffer())], BlobType));
        zip.file('face.buffer', new Blob([new Float32Array(this.accelerator.genFaceBuffer())], BlobType));
        zip.file('vertex.buffer', new Blob([new Float32Array(this.accelerator.genVertexBuffer())], BlobType));
        zip.file('normal.buffer', new Blob([new Float32Array(this.accelerator.genNormalBuffer())], BlobType));
        zip.file('material.buffer', new Blob([new Float32Array(this.accelerator.genMaterialBuffer())], BlobType));

        const zipBlob = await zip.generateAsync({type:'blob'});
        FileSaver.saveAs(zipBlob, name + '.scene');
    }

    async loadScenePackage(url) {
        const response = await fetch(url);
        const zip = await JSZip.loadAsync(await response.blob());
        const sceneInfo = JSON.parse(await zip.file('scene.json').async('string'));

        this.faceCount = sceneInfo.faceCount;

        this.accelerateBuffer = new TextureBuffer(await BlobReader(await zip.file('acc.buffer').async('blob')), AcceleratorBufferWidth);
        this.faceBuffer = new TextureBuffer(await BlobReader(await zip.file('face.buffer').async('blob')), FaceBufferWidth);
        this.vertexBuffer = new TextureBuffer(await BlobReader(await zip.file('vertex.buffer').async('blob')), VertexBufferWidth);
        this.normalBuffer = new TextureBuffer(await BlobReader(await zip.file('normal.buffer').async('blob')), NormalBufferWidth);
        this.materialBuffer = new TextureBuffer(await BlobReader(await zip.file('material.buffer').async('blob')), MaterialBufferWidth);
    }
}