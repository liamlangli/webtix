import { GPUPipeline } from '../webgl/pipeline';
import { GPUDevice } from '../device';
import { GPUVertexArray } from '../webgl/vertex-array';
import { create_screen_quad } from '../utils/prefab';
import { Color4 } from '../math/color';

export class Renderer {

  animation_index: number = -1;

  device: GPUDevice;
  pipeline?: GPUPipeline;

  width: number;
  height: number;

  clear_color: Color4 = new Color4(0, 0, 0, 0);

  private screen_quad_vertex_array: GPUVertexArray;

  constructor(public canvas: HTMLCanvasElement) {

    const context = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false }) as WebGL2RenderingContext;
    if (!context) {
      alert('require webgl2.0 supported.');
      throw 'require webgl2.0 supported.';
    }

    this.device = new GPUDevice(context);

    const ratio = window.devicePixelRatio * 2.0;
    this.width = canvas.width * ratio;
    this.height = canvas.height * ratio;
    canvas.width = this.width;
    canvas.height = this.height;

    context.viewport(0, 0, this.width, this.height);
  
    this.device.getExtension('EXT_color_buffer_float');
    this.device.getExtension('OES_texture_float_linear'); // this might be unnecessary

    canvas.oncontextmenu = function (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.screen_quad_vertex_array = create_screen_quad(this.device);
  }

  clear(colorMask: boolean, depthMask: boolean, stencilMask: boolean): void {
    const gl = this.device.getContext<WebGL2RenderingContext>();
    const color = this.clear_color;
    if (colorMask)
      gl.clearColor(color.R, color.G, color.B, color.A);

    let mask = 0;
    if (colorMask) mask |= gl.COLOR_BUFFER_BIT;
    if (depthMask) mask |= gl.DEPTH_BUFFER_BIT;
    if (stencilMask) mask |= gl.STENCIL_BUFFER_BIT;

    gl.clear(mask);
  }

  render(): void {
    if (this.pipeline) {
      this.pipeline.activate();

      const gl = this.device.getContext<WebGL2RenderingContext>();
      this.screen_quad_vertex_array.activate();
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindVertexArray(null);
    }
  }

  setPipeline(pipeline: GPUPipeline): void {
    this.pipeline = pipeline;
    this.pipeline.activate();
  }
}
