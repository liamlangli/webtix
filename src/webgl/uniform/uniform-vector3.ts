import { GPUDevice } from "../../device";
import { Uniform } from "./uniform";
import { Vector3 } from "../../math/vector3";
import { GPUPipeline } from "../pipeline";

export class UniformVector3 implements Uniform {

  location?: WebGLUniformLocation;
  v: Vector3 = new Vector3();

  constructor(public name: string, v: Vector3) {
    this.v.copy(v);
  }

  set(v: Vector3): UniformVector3 {
    this.v.copy(v);
    return this;
  }

  upload(pipeline: GPUPipeline): void {
    const gl = pipeline.device.getContext<WebGL2RenderingContext>();
    gl.uniform3f(this.location!, this.v.x, this.v.y, this.v.z);
  }

}
