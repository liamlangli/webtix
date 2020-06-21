import { GPUPipeline, GPUPipelineDescriptor } from '../webgl/pipeline';
import { compute_normal_indexed } from '../utils/compute-normal';
import { bvh_build_geometry_indexed } from './mesh-bvh';
import { TextureBuffer } from './texture-buffer';
import { UniformBlock } from '../webgl/uniform-block';
import { Renderer } from './renderer';
import { Engine } from './engine';
import { Camera } from './camera';
import { UniformStruct } from '../webgl/uniform/uniform-struct';
import { SphericalControl } from '../control/spherical-control';
import * as ScreenVert from '../kernel/screen_vert.glsl';
import * as PathTracingFrag from '../kernel/path_tracing_frag.glsl';
import * as BlendFrag from '../kernel/blend_frag.glsl';
import * as RenderFrag from '../kernel/render_frag.glsl';
import { SwapTarget } from '../webgl/swap-target';
import { EventHub } from '../event/event';
import { GlobalEvent } from '../event/global-event';
import { Target } from '../webgl/target';
import { ShaderLib } from '../webgl/shader-lib';
import { KERNEL_RAY_GENERATE, KERNEL_RAY_CLOSEST_HIT, KERNEL_RAY_MISSED } from '../constants';
import { UniformTexture } from '../webgl/uniform/uniform-texture';
import { UniformVector4 } from '../webgl/uniform/uniform-vector4';
import { create_white_texture } from '../utils/prefab';
import { hdr_load } from '../loaders/hdr-loader';
import { Geometry } from '../webgl/geometry';

const TRACE_DEPTH_LABEL = 'TRACE_DEPTH';

const FRAME_TEXTURE_LABEL = 'frame';
const FRAME_STATUS_LABEL = 'frame_status';
const HISTORY_LABEL = 'history';
const ENVIRONMENT_LABEL = 'environment';

export enum PathTraceMode {
  Render = 0,
  Bake = 1
}

export class PathTraceEngine extends Engine {

  trace_pipeline_descriptor: GPUPipelineDescriptor;
  trace_pipeline?: GPUPipeline;
  trace_block: UniformBlock;

  blend_pipeline_descriptor: GPUPipelineDescriptor;
  blend_pipeline?: GPUPipeline;
  blend_block: UniformBlock;

  render_pipeline?: GPUPipeline;
  render_block: UniformBlock;

  camera: Camera;
  camera_uniform?: UniformStruct;
  control: SphericalControl;


  private last_defer_time: number = 0;
  private defer_frame_index: number = 0;
  private defer_sample_count: number = 64;
  private defer_delay: number = 200;

  private need_draw: boolean = true;
  private swap_target: SwapTarget;
  private render_target: Target;

  private mode: PathTraceMode = PathTraceMode.Render;

  private environment_texture = create_white_texture(this.device);

  constructor(public renderer: Renderer) {
    super(renderer);

    this.swap_target = new SwapTarget(this.device, this.renderer.width, this.renderer.height);
    this.render_target = new Target(this.device, this.renderer.width, this.renderer.height);

    this.trace_pipeline_descriptor = new GPUPipelineDescriptor();
    this.trace_pipeline_descriptor.vertexShader = ScreenVert as any;
    this.trace_pipeline_descriptor.fragmentShader = PathTracingFrag as any;
    this.trace_pipeline_descriptor.defines[TRACE_DEPTH_LABEL] = '2';
    this.trace_block = new UniformBlock();
    this.trace_pipeline_descriptor.block = this.trace_block;

    this.blend_pipeline_descriptor = new GPUPipelineDescriptor();
    this.blend_pipeline_descriptor.vertexShader = ScreenVert as any;
    this.blend_pipeline_descriptor.fragmentShader = BlendFrag as any;
    this.blend_block = new UniformBlock();
    this.blend_block.create_uniform_vector4(FRAME_STATUS_LABEL, this.defer_frame_index, this.defer_sample_count, Math.random(), -1);
    this.blend_block.create_uniform_texture(FRAME_TEXTURE_LABEL, this.render_target.color_attachment);
    this.blend_block.create_uniform_texture(HISTORY_LABEL, this.swap_target.front.color_attachment);
    this.blend_pipeline_descriptor.block = this.blend_block;
    this.blend_pipeline = this.device.createPipeline(this.blend_pipeline_descriptor);

    const render_pipeline_descriptor = new GPUPipelineDescriptor();
    render_pipeline_descriptor.vertexShader = ScreenVert as any;
    render_pipeline_descriptor.fragmentShader = RenderFrag as any;
    this.render_block = new UniformBlock();
    this.render_block.create_uniform_texture(FRAME_TEXTURE_LABEL, this.swap_target.back.color_attachment);
    render_pipeline_descriptor.block = this.render_block;
    this.render_pipeline = this.device.createPipeline(render_pipeline_descriptor);

    this.camera = new Camera(Math.PI / 2, 1.0);
    this.camera.position.set(0, 0, -2.0);

    this.control = new SphericalControl(renderer.canvas);
    this.control.spherical.from_vector3(this.camera.position);

    this.camera_uniform = this.trace_block.create_uniform_struct('Camera', new Float32Array(16), 0);

    EventHub.on(GlobalEvent.MouseMove, () => {
      this.need_draw = true;
      this.last_defer_time = performance.now();
      this.defer_frame_index = 0;
    });

    this.environment_texture = create_white_texture(this.device);
  }

  set_mode(mode: PathTraceMode): void {
    this.mode = mode;
  }

  set_geometry(geometry: Geometry): void {
    const device = this.device;

    const position = geometry.getAttribute('position');
    const uv = geometry.getAttribute('uv');

    if (position === undefined || uv === undefined) {
      throw `require position & uv attribute.`;
    }
  
    const indexBuffer = geometry.index!.array as Uint32Array;
    const positionBuffer = position.array as Float32Array;
    const uvBuffer = uv!.array as Float32Array;
  
    let normal = geometry.getAttribute('normal');
    if (normal === undefined) {
      console.warn('recompute normal attribute');
      const normalBuffer = compute_normal_indexed(indexBuffer, positionBuffer);
      geometry.setAttribute({name: 'normal', array: normalBuffer, itemSize: 3, slot: 2});
      normal = geometry.getAttribute('normal');
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
    
    const block = this.trace_block;
    block.create_uniform_texture(texture_buffer_bvh.name + '_buffer', texture_bvh);
    block.create_uniform_texture(texture_buffer_position.name + '_buffer', texture_position);
    block.create_uniform_texture(texture_buffer_normal.name + '_buffer', texture_normal);
    block.create_uniform_texture(texture_buffer_index.name + '_buffer', texture_index);
    block.create_uniform_texture(texture_buffer_uv.name + '_buffer', texture_uv);
    block.create_uniform_texture(ENVIRONMENT_LABEL, this.environment_texture);
    block.create_uniform_vector4(FRAME_STATUS_LABEL);

    this.trace_pipeline_descriptor.buffers = buffers;
  }

  /**
   * @param uri hdr image uri
   */
  async set_environment(uri: string): Promise<void> {
    const descriptor = await hdr_load(uri);
    this.environment_texture = this.device.createTexture(descriptor);
    this.trace_block.get<UniformTexture>(ENVIRONMENT_LABEL)!.texture = this.environment_texture;
  }

  /**
   * set before engine run
   */
  set_ray_generate_kernel(kernel: string): void {
    ShaderLib.set(KERNEL_RAY_GENERATE, kernel);
  }

  set_sample_count(count: number): void {
    this.defer_sample_count = count;
  }

  /**
   * set before engine run
   */
  set_closest_hit_kernel(kernel: string): void {
    ShaderLib.set(KERNEL_RAY_CLOSEST_HIT, kernel);
  }

  /**
   * set before engine run
   */
  set_missed_kernel(kernel: string): void {
    ShaderLib.set(KERNEL_RAY_MISSED, kernel);
  }

  /**
   * set before engine run
   */
  set_bounce_depth(depth: number): void {
    this.trace_pipeline_descriptor.defines[TRACE_DEPTH_LABEL] = depth.toString();
  }

  start(): void {
    this.trace_pipeline = this.device.createPipeline(this.trace_pipeline_descriptor);
    this.renderer.setPipeline(this.trace_pipeline);
  }

  update(): void {
    // update uniforms
    const camera = this.camera;
    this.control.update();
    camera.position.copy(this.control.target);
    camera.look_at(this.control.center);
    camera.write(this.camera_uniform!.buffer);
    this.trace_block.get<UniformVector4>(FRAME_STATUS_LABEL)!.set(this.defer_frame_index, this.defer_sample_count, Math.random(), this.renderer.width);
  }

  frame = (time?: number): void => {
    this.animation_index = requestAnimationFrame(this.frame);
    const defer_render = (time! - this.last_defer_time) > this.defer_delay && this.defer_frame_index < this.defer_sample_count;

    if (this.need_draw) {
      this.need_draw = false;
      this.update();
      this.renderer.setPipeline(this.trace_pipeline!);
      this.renderer.render();
      return;
    }

    if (defer_render) {


      { // render trace result
        this.render_target.bind();
        this.renderer.setPipeline(this.trace_pipeline!);
        this.update();
        this.renderer.render();
        this.render_target.unbind();
      }

      { // blend
        this.swap_target.bind();
        this.renderer.setPipeline(this.blend_pipeline!);
  
        this.blend_block.get<UniformTexture>(HISTORY_LABEL)!.set(this.swap_target.back.color_attachment);
        this.blend_block.get<UniformVector4>(FRAME_STATUS_LABEL)!.set(this.defer_frame_index, this.defer_sample_count, Math.random(), this.renderer.width);
  
        this.renderer.render();
        this.swap_target.unbind();
        this.swap_target.swap();
      }

      { // display
        this.renderer.setPipeline(this.render_pipeline!);
        this.render_block.get<UniformTexture>(FRAME_TEXTURE_LABEL)!.set(this.swap_target.back.color_attachment);
        this.renderer.render();
      }
      this.defer_frame_index++;
    }
  }

}