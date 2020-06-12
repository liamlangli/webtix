import { GPUDevice } from "../../device";
import { Uniform } from "./uniform";
import { Matrix4 } from "../../math/mat4";

export class UniformMatrix4 implements Uniform {

  constructor(public name: string, public matrix: Matrix4) {}

  location?: WebGLUniformLocation | undefined;

  upload(device: GPUDevice): void {
    const gl = device.getContext<WebGL2RenderingContext>();
    gl.uniformMatrix4fv(this.location!, false, this.matrix.elements);
  }

}
