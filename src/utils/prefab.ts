import { GPUVertexArray } from '../webgl/vertex-array';
import { GPUBufferDescriptor } from '../webgl/buffer';
import { GPUDevice } from '../device';
import { GPUFloat, ARRAY_BUFFER } from '../webgl/webgl2-constant';
import { GPUTexture, GPUTextureDescriptor } from '../webgl';

let _screen_quad: GPUVertexArray;
export function create_screen_quad(device: GPUDevice): GPUVertexArray {
  if (_screen_quad !== undefined) {
    return _screen_quad;
  }

  const positions = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, 1, 1, 0, -1, 1, 0, -1, -1, 0]);

  const bufferDescriptor = new GPUBufferDescriptor();
  bufferDescriptor.size = 3;
  bufferDescriptor.dataType = GPUFloat;
  bufferDescriptor.type = ARRAY_BUFFER;

  const buffer = device.createBuffer(bufferDescriptor);
  buffer.bufferData(positions);

  _screen_quad = device.createVertexArray([buffer]);
  return _screen_quad;
}

let _white_texture: GPUTexture;
export function create_white_texture(device: GPUDevice): GPUTexture {
  if (_white_texture !== undefined) {
    return _white_texture;
  }

  const pixel = new Float32Array([1.0, 1.0, 1.0]);
  const descriptor = new GPUTextureDescriptor();
  descriptor.image = { width: 1, height: 1, data: pixel };
  _white_texture = device.createTexture(descriptor);
  return _white_texture;
}