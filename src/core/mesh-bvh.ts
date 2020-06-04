
import { Box3 } from '../math/box3';
import { QuickSort } from '../utils/quicksort';
import { Vector3 } from '../math/vector3';

enum Axis { X = 0, Y = 1, Z = 2 };
const BUFFER_STRIDE_BVH_NODE = 9;
const BUFFER_STRIDE_POINT = 3;
const BUFFER_STRIDE_BOX = 9;

class BVHNode {
  box: Box3 = new Box3();
  count: number = 0;
  index: number = -1;
  axis: Axis = Axis.X;

  write(buffer: Float32Array, offset: number): BVHNode {
    this.box.min.write(buffer, offset);
    this.box.max.write(buffer, offset + 3);
    buffer[offset + 6] = this.count;
    buffer[offset + 7] = this.index;
    buffer[offset + 8] = this.axis
    return this;
  }
}

// boxes buffer structure [minX, minY, minZ, maxX, maxY, maxZ, centerX, centerY, centerZ]
const BUFFER_BOX_OFFSET_CENTER = 6;

// temp object
const box0 = new Box3();
const point = new Vector3();
const node = new BVHNode();

// bvh node count
let bvh_node_count = 0;

// axis pointer
let axis = Axis.X;

// bounding boxes pointer
let index: Uint32Array | undefined;
let boxes: Float32Array | undefined;
let bvh: Float32Array | undefined;

/**
 * array buffer in-place bvh build
 *
 * @param index 
 * @param position 
 */
export function bvh_build_geometry_indexed(indexBuffer: Uint32Array, positionBuffer: Float32Array): Float32Array {

  const triangleCount = indexBuffer.length / 3;
  index = new Uint32Array(indexBuffer);
  boxes = new Float32Array(triangleCount * BUFFER_STRIDE_BOX);
  bvh = new Float32Array(triangleCount * 2 - 1);

  // compute triangle bounding boxes
  for (let i = 0; i < triangleCount; ++i) {

    box0.reset();
    for (let j = 0; j < BUFFER_STRIDE_POINT; ++j) {
      const pTriangle = index[i * BUFFER_STRIDE_POINT + j];
      point.read(positionBuffer, pTriangle * BUFFER_STRIDE_POINT);
      box0.expandByPoint3(point);
    }

    // save triangle box
    const pBox = i * BUFFER_STRIDE_BOX;
    box0.write(boxes, pBox);

  }

  bvh_node_count = 0;
  bvh_split_balanced(0, triangleCount - 1);

  const result = bvh;
  boxes = undefined;
  bvh = undefined;
  return result;
}

export function bvh_build_geometry(position: Float32Array) {
  // TODO
}

function bvh_box_longest_axis(box: Box3): number {
  const size = box.size;
  const max = size.maxElement();
  switch(max) {
    case size.x: return Axis.X;
    case size.y: return Axis.Y;
    case size.z: return Axis.Z;
  }
  return Axis.X;
}

function bvh_node_compare_func_axis(a: number, b: number): number {
  return boxes![a * BUFFER_STRIDE_BOX + BUFFER_BOX_OFFSET_CENTER + axis] - boxes![b * BUFFER_STRIDE_BOX + BUFFER_BOX_OFFSET_CENTER + axis];
}

function bvh_save_leaf_node(index: number): void {
  node.box.read(boxes!, index * BUFFER_STRIDE_BOX);
  node.index = index;
  node.count = 1;
  node.axis = axis;
}

/**
 * in-place bvh split algorithm
 */
function bvh_split_balanced(from: number, to: number): number {

  if (from === to) {
    bvh_save_leaf_node(from);
    return 1;
  }

  if (to - from === 1)
  {
    bvh_save_leaf_node(from);
    bvh_save_leaf_node(to);
    return 2;
  }

  node.box.reset();
  for (let i = from; i < to; ++i) {
    box0.read(boxes!, i * BUFFER_STRIDE_BOX);
    node.box.expandByBox3(box0);
  }

  // find longest axis
  axis = bvh_box_longest_axis(box0);
  QuickSort(index, from, to, bvh_node_compare_func_axis);

  const pivot = (from + (from - to) * 0.5) | 0;
  const left = bvh_split_balanced(from, pivot);
  const right = bvh_split_balanced(pivot, to);
  const count = left + right + 1;

  node.count = count;
  node.axis = axis;
  node.index = from;

  node.write(bvh!, bvh_node_count * BUFFER_STRIDE_BVH_NODE);

  return count;
}

function bvh_split_sah() {
  // TODO
}