import { GPUDevice } from "../device";
import { GPUTexture } from "./texture";
import { GPUPipeline } from "./pipeline";
import { Matrix4 } from "../math/mat4";

export interface Uniform {
  name: string;
  location?: WebGLUniformLocation;
  upload(device: GPUDevice): void;
}

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

  upload(device: GPUDevice): void {
    const gl = device.getContext<WebGL2RenderingContext>();
    gl.uniform4f(this.location!, this.x, this.y, this.z, this.w);
  }

}

export class UniformTexture implements Uniform {

  location?: WebGLUniformLocation | undefined;

  constructor(public name: string, public texture: GPUTexture, public slot: number) {}

  upload(device: GPUDevice): void {
    const gl = device.getContext<WebGL2RenderingContext>();
    this.texture.activate(this.slot);
    gl.uniform1i(this.location!, this.slot);
  }

}

export class UniformMatrix4 implements Uniform {

  constructor(public name: string, public matrix: Matrix4) {}

  location?: WebGLUniformLocation | undefined;

  upload(device: GPUDevice): void {
    const gl = device.getContext<WebGL2RenderingContext>();
    gl.uniformMatrix4fv(this.location!, false, this.matrix.elements);
  }

}

export class UniformBlock {

  uniforms: Uniform[] = [];
  uniform_map: Map<string, Uniform> = new Map();

  create_uniform_vector4(name: string, x?: number, y?: number, z?: number, w?: number): UniformVector4 {
    const uniform = new UniformVector4(name, x, y, z, w);
    this.uniforms.push(uniform);
    this.uniform_map.set(name, uniform);
    return uniform;
  }

  create_uniform_texture(name: string, texture: GPUTexture, slot: number = 0): UniformTexture {
    const uniform = new UniformTexture(name, texture, slot);
    this.uniforms.push(uniform);
    this.uniform_map.set(name, uniform);
    return uniform;
  }

  create_uniform_matrix4(name: string, matrix: Matrix4): UniformMatrix4 {
    const uniform = new UniformMatrix4(name, matrix);
    this.uniforms.push(uniform);
    this.uniform_map.set(name, uniform);
    return uniform;
  }

  get<T extends Uniform>(name: string): T | undefined {
    return this.uniform_map.get(name) as T;
  }

  locate(pipeline: GPUPipeline): void {
    const gl = pipeline.device.getContext<WebGL2RenderingContext>();
    for (let i = 0; i < this.uniforms.length; ++i) {
      const uniform = this.uniforms[i];
      uniform.location = gl.getUniformLocation(pipeline.program, uniform.name)!;
    }
  }

  upload(device: GPUDevice): void {
    for (let i = 0; i < this.uniforms.length; ++i) {
      const uniform = this.uniforms[i];
      uniform.upload(device);
    }
  }
}
