import { Vector3 } from "../math/vector3";

const v = new Vector3();
const v0 = new Vector3();
const v1 = new Vector3();
const v2 = new Vector3();


const BUFFER_STRIDE_TRIANGLE = 3;
const BUFFER_STRIDE_POSITION = 3;

/**
 * compute normal attribute area weight
 */
export function compute_normal_indexed(index: Uint32Array, position: Float32Array): Float32Array {
  const normal = new Float32Array(position.length);

  let p, p0, p1, p2;
  const triangleCount = index.length / 3;
  for (let i = 0; i < triangleCount; ++i) {
    
    p = i * BUFFER_STRIDE_TRIANGLE;
    p0 = index[p] * BUFFER_STRIDE_POSITION;
    p1 = index[p + 1] * BUFFER_STRIDE_POSITION;
    p2 = index[p + 2] * BUFFER_STRIDE_POSITION;

    v0.read(position, p0);
    v1.read(position, p1);
    v2.read(position, p2);

    v1.sub(v0);
    v2.sub(v0);

    // face normal
    v0.copy(v1).cross(v2);
    v1.copy(v0);
    v2.copy(v0);

    v.read(normal, p0).add(v0).write(normal, p0);
    v.read(normal, p1).add(v1).write(normal, p1);
    v.read(normal, p2).add(v2).write(normal, p2);
  }

  for (let i = 0, l = normal.length / 3; i < l; ++i) {
    p = i * BUFFER_STRIDE_POSITION;
    v.read(normal, p).normalize().write(normal, p);
  }

  return normal;
}