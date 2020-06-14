import { GPUVertexArray } from '../webgl/vertex-array';
import { GPUBufferDescriptor } from '../webgl/buffer';
import { GPUDevice } from '../device';
import { GPUFloat, ARRAY_BUFFER } from '../webgl/webgl2-constant';

let _screenQuad: GPUVertexArray;
export function createScreenQuad(device: GPUDevice): GPUVertexArray {
  if (_screenQuad !== undefined) {
    return _screenQuad;
  }

  const positions = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, 1, 1, 0, -1, 1, 0, -1, -1, 0]);

  const bufferDescriptor = new GPUBufferDescriptor();
  bufferDescriptor.size = 3;
  bufferDescriptor.dataType = GPUFloat;
  bufferDescriptor.type = ARRAY_BUFFER;

  const buffer = device.createBuffer(bufferDescriptor);
  buffer.bufferData(positions);

  _screenQuad = device.createVertexArray([buffer]);
  return _screenQuad;
}