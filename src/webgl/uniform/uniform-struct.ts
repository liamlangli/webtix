import { GPUDevice } from "../../device";
import { Uniform } from "./uniform";

export function isUniformStruct(uniform: Uniform): uniform is UniformStruct {
  return !!(uniform as any).isUniformStruct;
}

export class UniformStruct implements Uniform {

  isUniformStruct: boolean = true;

  location?: WebGLUniformLocation;

  gpu_buffer?: WebGLBuffer;

  constructor(public name: string, public buffer: Float32Array, public slot: number = 0) {}

  upload(device: GPUDevice): void {
    const gl = device.getContext<WebGL2RenderingContext>();
    if (this.gpu_buffer === undefined) {
      this.gpu_buffer = gl.createBuffer()!;
      gl.bindBuffer(gl.UNIFORM_BUFFER, this.gpu_buffer);
      gl.bufferData(gl.UNIFORM_BUFFER, this.buffer, gl.DYNAMIC_DRAW);
      gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.buffer);
      gl.bindBufferBase(gl.UNIFORM_BUFFER, this.slot, this.gpu_buffer);
      gl.bindBuffer(gl.UNIFORM_BUFFER, null);
    }
    gl.bindBuffer(gl.UNIFORM_BUFFER, this.gpu_buffer);
    gl.bufferSubData(gl.UNIFORM_BUFFER, 0, this.buffer);
    gl.bindBuffer(gl.UNIFORM_BUFFER, null);
  }

}
