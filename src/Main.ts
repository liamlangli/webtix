import { Renderer } from "./core/renderer";
import draco_decode, { draco_get_attribute, draco_set_attribute } from "./loaders/draco-loader";
import * as PathTracingVert from './kernel/path_tracing_vert.glsl';
import * as PathTracingFrag from './kernel/path_tracing_frag.glsl';
import { bvh_build_geometry_indexed } from "./core/mesh-bvh";
import { compute_normal_indexed } from "./utils/compute-normal";
import { TextureBuffer } from "./core/texture-buffer";
import { UniformBlock } from "./webgl/uniform-block";
import { GPUPipelineDescriptor } from "./webgl/pipeline";

const canvas = document.getElementById('view') as HTMLCanvasElement
const renderer = new Renderer(canvas);
const device = renderer.device;
(window as any).device = device;

async function main() {
  const geometry = await draco_decode('draco/bunny.drc');
  const position = draco_get_attribute(geometry, 'position');
  if (position === undefined) {
    throw `invalid geometry because of position attribute wasn\'t exists`;
  }

  const indexBuffer = geometry.index.array as Uint32Array;
  const positionBuffer = position.array as Float32Array;

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
  const texture_buffer_index = new TextureBuffer('index', new Float32Array(bvh.index));

  const buffers = new Map();
  buffers.set(texture_buffer_bvh.name, texture_buffer_bvh);
  buffers.set(texture_buffer_position.name, texture_buffer_position);
  buffers.set(texture_buffer_normal.name, texture_buffer_normal);
  buffers.set(texture_buffer_index.name, texture_buffer_index);

  const texture_bvh = texture_buffer_bvh.createGPUTexture(device);
  const texture_position = texture_buffer_position.createGPUTexture(device);
  const texture_normal = texture_buffer_normal.createGPUTexture(device);
  const texture_index = texture_buffer_index.createGPUTexture(device);
  
  const uniform_block = new UniformBlock();
  uniform_block.create_uniform_texture(texture_buffer_bvh.name + 'Buffer', texture_bvh, 0);
  uniform_block.create_uniform_texture(texture_buffer_position.name + 'Buffer', texture_position, 1);
  uniform_block.create_uniform_texture(texture_buffer_normal.name + 'Buffer', texture_normal, 2);
  uniform_block.create_uniform_texture(texture_buffer_index.name + 'Buffer', texture_index, 3);

  const pipeline_descriptor = new GPUPipelineDescriptor();
  pipeline_descriptor.vertexShader = PathTracingVert as any;
  pipeline_descriptor.fragmentShader = PathTracingFrag as any;
  pipeline_descriptor.buffers = buffers;
  pipeline_descriptor.block = uniform_block;

  const pipeline = device.createPipeline(pipeline_descriptor);
  console.log(pipeline);
}

main();