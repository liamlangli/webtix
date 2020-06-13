import { GPUDevice } from "../../device";
import { Uniform } from "./uniform";
import { GPUPipeline } from "../pipeline";

export class UniformFloat implements Uniform {

  location?: WebGLUniformLocation;

  constructor(public name: string, public value: number) {}

  set(value: number): UniformFloat {
    this.value = value;
    return this;
  }

  upload(pipeline: GPUPipeline): void {
    const gl = pipeline.device.getContext<WebGL2RenderingContext>();
    gl.uniform1f(this.location!, this.value);
  }

}
