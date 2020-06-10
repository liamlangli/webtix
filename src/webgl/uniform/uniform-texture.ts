import { Uniform } from "./uniform";
import { GPUTexture } from "../texture";
import { GPUDevice } from "../../device";

export class UniformTexture implements Uniform {

  location?: WebGLUniformLocation | undefined;

  constructor(public name: string, public texture: GPUTexture, public slot: number) {}

  upload(device: GPUDevice): void {
    const gl = device.getContext<WebGL2RenderingContext>();
    this.texture.activate(this.slot);
    gl.uniform1i(this.location!, this.slot);
  }

}