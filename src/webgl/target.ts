import { GPUDevice } from "../device";
import { GPUTexture, GPUTextureDescriptor } from "./texture";
import { RGBAFormat } from "./webgl2-constant";

export class Target {

  color_attachment: GPUTexture;
  depthBuffer: WebGLRenderbuffer;
  frameBuffer: WebGLFramebuffer;

  get gl(): WebGL2RenderingContext {
    return this.device.getContext<WebGL2RenderingContext>();
  }

  constructor(public device: GPUDevice, public width: number, public height: number) {
    const gl = this.gl;

    const color_attachment_descriptor = new GPUTextureDescriptor();
    color_attachment_descriptor.format = RGBAFormat;
    this.color_attachment = device.createTexture(color_attachment_descriptor);
    const texture = this.color_attachment.raw<WebGLTexture>();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, (gl as any).RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.bindTexture(gl.TEXTURE_2D, null);

    this.depthBuffer = gl.createRenderbuffer()!;
    gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
    gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
    gl.bindRenderbuffer(gl.RENDERBUFFER, null);

    this.frameBuffer = gl.createFramebuffer()!;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
    gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  bind() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
    gl.viewport(0, 0, this.width, this.height);
  }

  unbind() {
    const gl = this.gl;
    gl.bindFramebuffer(gl.FRAMEBUFFER, null);
  }

  delete() {
    const gl = this.gl;
    gl.deleteRenderbuffer(this.depthBuffer);
    gl.deleteFramebuffer(this.frameBuffer);
    this.color_attachment.delete();
  }
}