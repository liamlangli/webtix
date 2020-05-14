import { SwapTarget } from '../webgl/swap-target';
import { GPUPipeline } from '../webgl/pipeline';
import * as PathTracingVert from '../shaders/path_tracing_vert.glsl';
import * as PathTracingFrag from '../shaders/path_tracing_frag.glsl';
import { GPUDevice } from '../device';
import { GPUTextureDescriptor } from '../webgl/texture';
import { NearestFilter } from '../webgl/webgl2-constant';
import { GPUScene } from './gpu-scene';
import { GPUVertexArray } from '../webgl/vertex-array';
import { createScreenQuad } from '../utils/prefeb';

export class Renderer {

  device: GPUDevice;

  width: number;
  height: number;

  frameIndex: number = 1;
  sampleCount = 100;

  tracePipeline?: GPUPipeline;

  screenQuadVertexArray: GPUVertexArray;

  constructor(canvas: HTMLCanvasElement) {

    const context = canvas.getContext('webgl2', { preserveDrawingBuffer: true }) as WebGL2RenderingContext;
    if (!context) {
      throw 'Require WebGL2 Support.';
    }

    this.device = new GPUDevice(context);

    const ratio = window.devicePixelRatio
    this.width = canvas.width * ratio;
    this.height = canvas.height * ratio;
    canvas.width = this.width;
    canvas.height = this.height;

    const ext = this.device.getExtension('EXT_color_buffer_float');
    if (ext === undefined) {
      throw 'Require Float Buffer Extension.';
    }

    canvas.oncontextmenu = function (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.screenQuadVertexArray = createScreenQuad(this.device);
  }

  bindScene(scene: GPUScene) {

    const textureBufferDescriptor = new GPUTextureDescriptor();
    textureBufferDescriptor.magFilter = NearestFilter;
    textureBufferDescriptor.minFilter = NearestFilter;

    const accelerateTexture = this.device.createTexture(textureBufferDescriptor);
    const faceTexture = this.device.createTexture(textureBufferDescriptor);
    const vertexTexture = this.device.createTexture(textureBufferDescriptor);
    const normalTexture = this.device.createTexture(textureBufferDescriptor);
    const materialTexture = this.device.createTexture(textureBufferDescriptor);

    this.tracePipeline = this.device.createPipeline(PathTracingVert as any, PathTracingFrag as any);
  }

  frame(): void {
    this.screenQuadVertexArray.activate();
    // gl.drawArrays(gl.TRIANGLES, 0, 6);
    // (gl as any).bindVertexArray(null);
  }

  start = (): void  => {
    this.frame();
    requestAnimationFrame(this.start);
  }
}
