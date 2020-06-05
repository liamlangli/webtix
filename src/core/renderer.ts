import { SwapTarget } from '../webgl/swap-target';
import { GPUPipeline } from '../webgl/pipeline';
import * as PathTracingVert from '../kernel/path_tracing_vert.glsl';
import * as PathTracingFrag from '../kernel/path_tracing_frag.glsl';
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

  screenQuadVertexArray: GPUVertexArray;

  constructor(canvas: HTMLCanvasElement) {

    const context = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false }) as WebGL2RenderingContext;
    if (!context) {
      throw 'Require WebGL2 Support.';
    }

    this.device = new GPUDevice(context);

    const ratio = window.devicePixelRatio
    this.width = canvas.width * ratio;
    this.height = canvas.height * ratio;
    canvas.width = this.width;
    canvas.height = this.height;
  
    this.device.getExtension('EXT_color_buffer_float');
    this.device.getExtension('OES_texture_float_linear');

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
