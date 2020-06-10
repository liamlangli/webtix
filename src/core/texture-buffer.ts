import { GPUTexture, GPUTextureDescriptor } from "../webgl/texture";
import { GPUDevice } from "../device";
import { NearestFilter } from "../webgl/webgl2-constant";

export interface TextureBufferInfo {
  count: number;
  width: number;
  height: number;
}

const MAX_TEXTURE_SIZE = 4096;
const BUFFER_STRIDE_PIXEL_RGB = 3;
const LOWER_A_CHAR_CODE = 97;

interface texture_buffer_layout {
  width: number;
  height: number;
  count: number;
  stride: number;
}

/**
 * @warning
 *    Don't try to understand this function. It's just use to generate shader code
 * to read buffered data from texture.
 *    Peace
 * @param layout count, width, height
 */
function shader_node_texture_buffer_stringify(name: string, layout: texture_buffer_layout): string {

  const { width, height, count, stride } = layout;

  // define output struct
  let output_struct = '';
  if (stride > 1) {
    output_struct =
`struct ${name}_block {
  vec3 a;
`;
    for (let i = 1; i < stride; ++i)
    {
      output_struct += `  vec3 ${String.fromCharCode(LOWER_A_CHAR_CODE + i)};\n`;
    }
    output_struct += '};\n';
  }

  // define fetch pixel
  let fetch_pixels = `vec3 a = textureLod(${name}_buffer, pos, 0.0).rgb;\n  return a;`;
  if (stride > 1) {
    let param = 'a';
    let label = '';
    fetch_pixels = `vec3 a = textureLod(${name}_buffer, pos, 0.0).rgb;\n`;
    for (let i = 1; i < stride; ++i)
    {
      label = String.fromCharCode(LOWER_A_CHAR_CODE + i);
      fetch_pixels += `  vec3 ${label} = textureLodOffset(${name}_buffer, pos, 0.0, ivec2(${i}, 0)).rgb;\n`;
      param += `, ${label}`;
    }
    fetch_pixels += `  return ${name}_block(${param});`;
  }

    return `
#ifndef ${name}_fetch
#define ${name}_fetch

texture_buffer_layout ${name}_layout = texture_buffer_layout(${width.toFixed(1)}, ${height.toFixed(1)}, ${count.toFixed(1)}, ${stride.toFixed(1)});
uniform sampler2D ${name}_buffer;
${output_struct}
${stride > 1 ? name + '_block' : 'vec3' } fetch_${name}(const float index) {
  float scalar = index / ${name}_layout.width;
  float row = floor(scalar) / ${name}_layout.height;
  float column = fract(scalar);
  vec2 pos = vec2(0.5 / vec2(${name}_layout.width, ${name}_layout.height)) + vec2(column, row);
  ${fetch_pixels}
}

#endif
`;
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
    const row_max_data_count = (MAX_TEXTURE_SIZE / stride) | 0;
    const buffer_width = row_max_data_count * stride;

    const length = inputData.length / BUFFER_STRIDE_PIXEL_RGB;
    this.count = length;

    const lines = Math.ceil(length / buffer_width);
    const output = new Float32Array(lines * buffer_width * BUFFER_STRIDE_PIXEL_RGB);
    output.set(inputData);

    this.width = buffer_width;
    this.height = lines;
    this.data = output;
    this.name = name;
    this.stride = stride;
  }

  toString(): string {
    const width = this.width;
    const height = this.height;
    const count = this.count;
    const stride = this.stride;
    return shader_node_texture_buffer_stringify(this.name, { width, height, count, stride });
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