import { GPUDevice } from "../../device";
import { Uniform } from "./uniform";

export class UniformFloat implements Uniform {

  location?: WebGLUniformLocation;

  constructor(public name: string, public value: number) {}

  set(value: number): UniformFloat {
    this.value = value;
    return this;
  }

  upload(device: GPUDevice): void {
    const gl = device.getContext<WebGL2RenderingContext>();
    gl.uniform1f(this.location!, this.value);
  }

}
