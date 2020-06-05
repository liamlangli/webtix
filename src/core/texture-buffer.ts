import { Vector3 } from "../math/vector3";
import { GPUTexture, GPUTextureDescriptor } from "../webgl/texture";
import { GPUDevice } from "../device";
import { RGBFormat, NearestFilter } from "../webgl/webgl2-constant";

export interface TextureBufferInfo {
  count: number;
  width: number;
  height: number;
}

const MAX_TEXTURE_SIZE = 8192;
const BUFFER_STRIDE_PIXEL_RGB = 3;

/**
 * generate shader node code
 * @param layout count, width, height
 */
function shader_node_texture_buffer_stringify(name: string, stride: number, layout: Vector3): string {
  if (stride === 1) {
    return `
#ifndef ${name}_fetch
#define ${name}_fetch

vec3 ${name}_size = vec3(${layout.x.toFixed(4)}, ${layout.y.toFixed(4)}, ${layout.z.toFixed(4)});
uniform sampler2D ${name}_buffer;

vec3 fetch_${name}(const float index) {
  float scalar = index / ${name}_size.y;
  float row = floor(scalar) / ${name}_size.z;
  float column = fract(scalar);
  vec2 pos = vec2(0.5 / ${name}_size.yz) + vec2(column, row);
  return textureLod(${name}_buffer, pos, 0.0).rgb;
}

#endif
    `;
  }

  return ``;
}

/**
 * Texture buffer: convert array buffer to gpu texture.
 * Description:
 *   Assume texture save with RGBFormat to align gpu memory,
 */
export class TextureBuffer {

  count: number; // valid pixel count
  width: number;
  height: number;

  data: Float32Array;

  name: string;
  stride: number;

  constructor(name: string, inputData: number[] | Float32Array, stride: number = 1) {
    // align data with RGB color format

    // max pixel on the same row
    const bufferWidth = ((MAX_TEXTURE_SIZE / stride) | 0) * stride;

    const length = inputData.length / BUFFER_STRIDE_PIXEL_RGB;
    this.count = length;

    const lines = Math.ceil(length / bufferWidth);
    const output = new Float32Array(lines * bufferWidth * stride * BUFFER_STRIDE_PIXEL_RGB);
    output.set(inputData);

    this.width = bufferWidth;
    this.height = lines;
    this.data = new Float32Array(output);
    this.name = name;
    this.stride = stride;
  }

  toString(): string {
    return shader_node_texture_buffer_stringify(this.name, this.stride, new Vector3(this.count, this.width, this.height));
  }

  createGPUTexture(device: GPUDevice): GPUTexture {
    const descriptor = new GPUTextureDescriptor();
    descriptor.magFilter = NearestFilter;
    descriptor.minFilter = NearestFilter;

    const texture = device.createTexture(descriptor);
    texture.bufferData(this.data, this.width, this.height);

    return texture;
  }

}