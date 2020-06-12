import { GPUPipeline, GPUPipelineDescriptor } from "../webgl/pipeline";
import { draco_get_attribute, draco_set_attribute, DracoGeometry } from '../loaders/draco-loader';
import { compute_normal_indexed } from '../utils/compute-normal';
import { bvh_build_geometry_indexed } from './mesh-bvh';
import { TextureBuffer } from './texture-buffer';
import { UniformBlock } from '../webgl/uniform-block';
import { Renderer } from "./renderer";
import { Engine } from "./engine";
import { Camera } from "./camera";
import { UniformStruct } from "../webgl/uniform/uniform-struct";
import { SphericalControl } from "../control/spherical-control";
import * as PathTracingVert from '../kernel/path_tracing_vert.glsl';
import * as PathTracingFrag from '../kernel/path_tracing_frag.glsl';

const TRACE_DEPTH_LABEL = 'TRACE_DEPTH';

export class PathTraceEngine extends Engine {

  pipeline_descriptor: GPUPipelineDescriptor;
  pipeline?: GPUPipeline;
  block: UniformBlock;

  camera: Camera;
  camera_uniform?: UniformStruct;
  control: SphericalControl;

  constructor(public renderer: Renderer) {
    super(renderer);

    this.block = new UniformBlock();
    this.pipeline_descriptor = new GPUPipelineDescriptor();

    this.camera = new Camera(Math.PI / 2, 1.0);
    this.camera.position.set(0, 0, -2.0);

    this.control = new SphericalControl(renderer.canvas);
    this.control.spherical.from_vector3(this.camera.position);

    this.camera_uniform = this.block.create_uniform_struct('Camera', new Float32Array(16), 0);
  }

  set_geometry(geometry: DracoGeometry): void {
    const device = this.device;

    const position = draco_get_attribute(geometry, 'position');
    const uv = draco_get_attribute(geometry, 'uv');

    if (position === undefined || uv === undefined) {
      throw `require position & uv attribute.`;
    }
  
    const indexBuffer = geometry.index.array as Uint32Array;
    const positionBuffer = position.array as Float32Array;
    const uvBuffer = uv!.array as Float32Array;
  
    let normal = draco_get_attribute(geometry, 'normal');
    if (normal === undefined) {
      console.warn('recompute normal attribute');
      const normalBuffer = compute_normal_indexed(indexBuffer, positionBuffer);
      draco_set_attribute(geometry, 'normal', normalBuffer, 3);
      normal = draco_get_attribute(geometry, 'normal');
    }
  
    const normalBuffer = normal!.array as Float32Array;
    const bvh = bvh_build_geometry_indexed(indexBuffer, positionBuffer);
    const texture_buffer_bvh = new TextureBuffer('bvh', bvh.nodes, 3);
    const texture_buffer_position = new TextureBuffer('position', positionBuffer);
    const texture_buffer_normal = new TextureBuffer('normal', normalBuffer);
    const texture_buffer_uv = new TextureBuffer('uv', uvBuffer);
    const texture_buffer_index = new TextureBuffer('index', bvh.index);
  
    const buffers = new Map();
    buffers.set(texture_buffer_bvh.name, texture_buffer_bvh);
    buffers.set(texture_buffer_position.name, texture_buffer_position);
    buffers.set(texture_buffer_normal.name, texture_buffer_normal);
    buffers.set(texture_buffer_index.name, texture_buffer_index);
    buffers.set(texture_buffer_uv.name, texture_buffer_uv);
  
    const texture_bvh = texture_buffer_bvh.createGPUTexture(device);
    const texture_position = texture_buffer_position.createGPUTexture(device);
    const texture_normal = texture_buffer_normal.createGPUTexture(device);
    const texture_index = texture_buffer_index.createGPUTexture(device);
    const texture_uv = texture_buffer_uv.createGPUTexture(device);
    
    const block = this.block;
    block.create_uniform_texture(texture_buffer_bvh.name + '_buffer', texture_bvh, 1);
    block.create_uniform_texture(texture_buffer_position.name + '_buffer', texture_position, 2);
    block.create_uniform_texture(texture_buffer_normal.name + '_buffer', texture_normal, 3);
    block.create_uniform_texture(texture_buffer_index.name + '_buffer', texture_index, 4);
    block.create_uniform_texture(texture_buffer_uv.name + '_buffer', texture_uv, 5);

    this.pipeline_descriptor.buffers = buffers;
    this.pipeline_descriptor.block = this.block;
    this.pipeline_descriptor.vertexShader = PathTracingVert as any;
    this.pipeline_descriptor.fragmentShader = PathTracingFrag as any;

    this.pipeline_descriptor.defines[TRACE_DEPTH_LABEL] = '2';
  }

  set_ray_generate_kernel(kernel: string): void {}

  set_closest_hit_kernel(kernel: string): void {}

  set_missed_kernel(kernel: string): void {}

  set_bounce_depth(depth: number): void {
    this.pipeline_descriptor.defines[TRACE_DEPTH_LABEL] = depth.toString();
  }

  start(): void {
    this.pipeline = this.device.createPipeline(this.pipeline_descriptor);
    this.renderer.setPipeline(this.pipeline);
  }

  update(): void {
    // update uniforms
    const camera = this.camera;
    this.control.update();
    camera.position.copy(this.control.target);
    camera.look_at(this.control.center);
    camera.write(this.camera_uniform!.buffer);
  }

}