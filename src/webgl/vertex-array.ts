import { GPUDevice } from '../device';
import { GPUBuffer } from './buffer';

export interface GPUVertexArray {
  activate(): void;
}

export class GPUVertexArrayInternal implements GPUVertexArray {

  vertexArrayObject: WebGLVertexArrayObject;

  constructor(public device: GPUDevice, buffers: GPUBuffer[]) {
    const gl = device.getContext<WebGL2RenderingContext>();
    this.vertexArrayObject = gl.createVertexArray()!;

    gl.bindVertexArray(this.vertexArrayObject);
    for (let i = 0; i < buffers.length; ++i) {
      if (!buffers[i])
        continue;
      buffers[i].activate(i);
    }
    gl.bindVertexArray(null);
  }

  activate(): void {
    const gl = this.device.getContext<WebGL2RenderingContext>();
    gl.bindVertexArray(this.vertexArrayObject);
  }

}

