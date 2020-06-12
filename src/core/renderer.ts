import { GPUPipeline, GPUPipelineDescriptor } from '../webgl/pipeline';
import { GPUDevice } from '../device';
import { GPUVertexArray } from '../webgl/vertex-array';
import { createScreenQuad } from '../utils/prefab';
import * as PathTracingVert from '../kernel/path_tracing_vert.glsl';
import * as PathTracingFrag from '../kernel/path_tracing_frag.glsl';
import draco_decode, { draco_get_attribute, draco_set_attribute } from '../loaders/draco-loader';
import { compute_normal_indexed } from '../utils/compute-normal';
import { bvh_build_geometry_indexed } from './mesh-bvh';
import { TextureBuffer } from './texture-buffer';
import { Camera } from './camera';
import { UniformBlock } from '../webgl/uniform-block';
import { SphericalControl } from '../control/spherical-control';
import EventHub from './event';
import { GlobalEvent } from './global-event';
import { UniformStruct } from '../webgl/uniform/uniform-struct';

export class Renderer {

  device: GPUDevice;
  pipeline?: GPUPipeline;

  width: number;
  height: number;

  control: SphericalControl;

  camera: Camera;
  camera_uniform?: UniformStruct;

  private screenQuadVertexArray: GPUVertexArray;

  private frame_index: number = 0;
  private sample_count: number = 1;

  constructor(canvas: HTMLCanvasElement) {

    const context = canvas.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false }) as WebGL2RenderingContext;
    if (!context) {
      throw 'Require WebGL2 Support.';
    }

    this.device = new GPUDevice(context);

    const ratio = 2.0;
    this.width = canvas.width * ratio;
    this.height = canvas.height * ratio;
    canvas.width = this.width;
    canvas.height = this.height;

    context.viewport(0, 0, this.width, this.height);
  
    this.device.getExtension('EXT_color_buffer_float');
    this.device.getExtension('OES_texture_float_linear');

    canvas.oncontextmenu = function (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.screenQuadVertexArray = createScreenQuad(this.device);

    this.camera = new Camera(Math.PI / 2, 1.0);
    this.camera.position.set(0, 0, -2.0);

    this.control = new SphericalControl(canvas);
    this.control.spherical.from_vector3(this.camera.position);

    EventHub.on(GlobalEvent.MouseMove, () => {
      this.frame_index = 0;
    });
  }

  async launch(): Promise<void> {
    const device = this.device;

    const geometry = await draco_decode('draco/helmet.drc');
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
    // const texture_buffer_uv = new TextureBuffer('uv', uvBuffer);
    const texture_buffer_index = new TextureBuffer('index', bvh.index);
  
    const buffers = new Map();
    buffers.set(texture_buffer_bvh.name, texture_buffer_bvh);
    buffers.set(texture_buffer_position.name, texture_buffer_position);
    buffers.set(texture_buffer_normal.name, texture_buffer_normal);
    buffers.set(texture_buffer_index.name, texture_buffer_index);
    // buffers.set(texture_buffer_uv.name, texture_buffer_uv);
  
    const texture_bvh = texture_buffer_bvh.createGPUTexture(device);
    const texture_position = texture_buffer_position.createGPUTexture(device);
    const texture_normal = texture_buffer_normal.createGPUTexture(device);
    const texture_index = texture_buffer_index.createGPUTexture(device);
    // const texture_uv = texture_buffer_uv.createGPUTexture(device);
    
    const uniform_block = new UniformBlock();
    uniform_block.create_uniform_texture(texture_buffer_bvh.name + '_buffer', texture_bvh, 0);
    uniform_block.create_uniform_texture(texture_buffer_position.name + '_buffer', texture_position, 1);
    uniform_block.create_uniform_texture(texture_buffer_normal.name + '_buffer', texture_normal, 2);
    uniform_block.create_uniform_texture(texture_buffer_index.name + '_buffer', texture_index, 3);
    // uniform_block.create_uniform_texture(texture_buffer_uv.name + '_buffer', texture_uv, 4);
  
    // view
    this.camera_uniform = uniform_block.create_uniform_struct('Camera', new Float32Array(16), 0);
  
    const pipeline_descriptor = new GPUPipelineDescriptor();
    pipeline_descriptor.vertexShader = PathTracingVert as any;
    pipeline_descriptor.fragmentShader = PathTracingFrag as any;
    pipeline_descriptor.buffers = buffers;
    pipeline_descriptor.block = uniform_block;
  
    const pipeline = device.createPipeline(pipeline_descriptor);
    this.setPipeline(pipeline);
  }

  frame(): void {
    if (this.pipeline) {
      if (this.frame_index >= this.sample_count) {
        return;
      }
      ++this.frame_index;

      // update uniforms
      const camera = this.camera;
      this.control.update();
      camera.position.copy(this.control.target);
      camera.look_at(this.control.center);
      camera.write(this.camera_uniform!.buffer);

      if (this.pipeline.block) {
        this.pipeline.block.upload(this.device);
      }

      const gl = this.device.getContext<WebGL2RenderingContext>();
      this.screenQuadVertexArray.activate();
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      gl.bindVertexArray(null);
    }
  }

  setPipeline(pipeline: GPUPipeline): void {
    this.pipeline = pipeline;
    this.pipeline.activate();
  }

  loop_event = (): void => {
    this.frame();
    requestAnimationFrame(this.loop_event);
  }

  start = (): void  => {
    this.launch();
    this.loop_event();
  }
}
