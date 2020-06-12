import { GPUDevice } from "../device";
import { GPUBufferDataType, GPUFloat, BufferType, ARRAY_BUFFER } from "./webgl2-constant";
import { BufferArray } from "../types";

export interface GPUBuffer {
  activate(location: number): void;
  bufferData(data: BufferArray): void;
}

export class GPUBufferDescriptor {
  type: BufferType = ARRAY_BUFFER;
  dataType: GPUBufferDataType = GPUFloat;
  size: number = 0;
}

export class GPUBufferInternal implements GPUBuffer {

  type: BufferType;
  dataType: GPUBufferDataType;
  size: number;

  buffer: WebGLBuffer;

  constructor(public device: GPUDevice, descriptor: GPUBufferDescriptor) {
    const gl = device.getContext<WebGL2RenderingContext>();
    this.buffer = gl.createBuffer()!;

    this.type = descriptor.type;
    this.dataType = descriptor.dataType;
    this.size = descriptor.size;
  }

  bufferData(data: BufferArray): void {
    const gl = this.device.getContext<WebGL2RenderingContext>();
    gl.bindBuffer(this.type, this.buffer);
    gl.bufferData(this.type, data, gl.STATIC_DRAW);
    gl.bindBuffer(this.type, null);
  }

  activate(location: number): void {
    const gl = this.device.getContext<WebGL2RenderingContext>();
    gl.bindBuffer(this.type, this.buffer);
    if (this.type === ARRAY_BUFFER) {
      gl.vertexAttribPointer(location, this.size, this.dataType, false, 0, 0);
      gl.enableVertexAttribArray(location);
    }
    gl.bindBuffer(this.type, null);
  }

}
