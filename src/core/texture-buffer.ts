export const VertexBufferWidth = 1024 * 3;
export const NormalBufferWidth = 1024 * 3;
export const FaceBufferWidth = 1024 * 2;
export const AcceleratorBufferWidth = 1024 * 3;
export const MaterialBufferWidth = 1024 * 1;

export interface TextureBufferInfo {
  count: number;
  width: number;
  height: number;
}

/**
 * Texture buffer: convert array buffer to gpu texture.
 * Description:
 *   Assume texture save with RGBFormat to align gpu memory,
 */
export class TextureBuffer {

  count: number; // Pixel Count
  width: number;
  height: number;
  data: Float32Array;

  constructor(inputData: number[] | Float32Array, bufferWidth: number) {
    // align data with RGB color format
    const length = inputData.length / 3;
    this.count = length;
    const lines = Math.ceil(length / bufferWidth);
    const output = new Float32Array(lines * bufferWidth * 3);
    output.set(inputData);

    this.width = bufferWidth;
    this.height = lines;
    this.data = new Float32Array(output);
  }

}