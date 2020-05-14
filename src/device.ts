import { GPUTexture, GPUTextureDescriptor, GPUTextureInternal } from "./webgl/texture";
import { GPUBufferDescriptor, GPUBufferInternal, GPUBuffer } from "./webgl/buffer";
import { GPUVertexArray, GPUVertexArrayInternal } from "./webgl/vertex-array";
import { GPUPipeline } from "./webgl/pipeline";

export type GPUContext = WebGL2RenderingContext;

export class GPUDevice {

  private _context: GPUContext;

  private extensions: Map<string, any> = new Map();

  constructor(context: GPUContext) {
    this._context = context;
  }

  public get context(): GPUContext {
    return this._context as GPUContext;
  }

  public getContext<T extends GPUContext>(): T {
    return this._context as T;
  }

  getExtension<T>(name: string): T | undefined {
    let extension = this.extensions.get(name);
    if (extension) {
      return extension;
    }

    extension = this.context.getExtension(name);
    if (extension) {
      this.extensions.set(name, extension);
      return extension;
    }

    console.warn(`Extension [${name}] invalid.`);
  }

  createTexture(descriptor: GPUTextureDescriptor): GPUTexture {
    const texture = new GPUTextureInternal(this, descriptor);
    return texture;
  }

  createBuffer(descriptor: GPUBufferDescriptor): GPUBuffer {
    const buffer = new GPUBufferInternal(this, descriptor);
    return buffer;
  }

  createVertexArray(buffers: GPUBuffer[]): GPUVertexArray {
    const vertexArray = new GPUVertexArrayInternal(this, buffers);
    return vertexArray;
  }

  createPipeline(vertexShader: string, fragmentShader: string): GPUPipeline {
    const pipeline = new GPUPipeline(this, vertexShader, fragmentShader);
    return pipeline;
  }

}