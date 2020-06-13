import { Target } from "./target";
import { Color4 } from "../math/color";
import { GPUDevice } from "../device";

export class SwapTarget {

  front: Target;
  back: Target;

  get gl(): WebGL2RenderingContext {
    return this.device.getContext<WebGL2RenderingContext>();
  }

  constructor(public device: GPUDevice, public width: number, public height: number) {
    this.front = new Target(device, width, height);
    this.back = new Target(device, width, height);
  }

  swap(): void {
    let tmp = this.front;
    this.front = this.back;
    this.back = tmp;
  }

  bind(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.front.frameBuffer);
    gl.viewport(0, 0, this.width, this.height);
  }

  clear(color: Color4, colorMask: boolean, depthMask: boolean, stencilMask: boolean): void {
    const gl = this.gl;
    if (colorMask)
      gl.clearColor(color.R, color.G, color.B, color.A);

    let mask = 0;
    if (colorMask) mask |= gl.COLOR_BUFFER_BIT;
    if (depthMask) mask |= gl.DEPTH_BUFFER_BIT;
    if (stencilMask) mask |= gl.STENCIL_BUFFER_BIT;

    gl.clear(mask);
  }

  unbind(): void {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  delete() {
    this.front.delete();
    this.back.delete();
  }
}