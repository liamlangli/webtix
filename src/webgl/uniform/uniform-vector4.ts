import { Uniform } from './uniform';
import { GPUPipeline } from '../pipeline';

export class UniformVector4 implements Uniform {

  location?: WebGLUniformLocation;
  
  private x: number;
  private y: number;
  private z: number;
  private w: number;

  constructor(public name: string, x?: number, y?: number, z?: number, w?: number) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.w = w || 0;
  }

  set(x: number, y: number, z: number, w: number): UniformVector4 {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
    return this;
  }

  upload(pipeline: GPUPipeline): void {
    const gl = pipeline.device.getContext<WebGL2RenderingContext>();
    gl.uniform4f(this.location!, this.x, this.y, this.z, this.w);
  }

}
