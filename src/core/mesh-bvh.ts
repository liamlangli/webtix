
import { Box3 } from '../math/box3';
import { QuickSort } from '../utils/quicksort';
import { Vector3 } from '../math/vector3';

enum Axis { X = 0, Y = 1, Z = 2 };
const BUFFER_OFFSET_BVH_COUNT = 6;
const BUFFER_STRIDE_BVH_NODE = 9;
const BUFFER_STRIDE_POSITION = 3;
const BUFFER_STRIDE_INDEX = 3;
const BUFFER_STRIDE_BOX = 9;
const BUFFER_BOX_OFFSET_CENTER = 6;

export interface BVH {
  nodes: Float32Array;
  index: Float32Array;
  count: number;
}

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

const box = new Box3();
const point = new Vector3();
const node = new BVHNode();

// bvh node count
let bvh_node_count = 0;

// axis pointer
let axis = Axis.X;

// bounding boxes pointer
let index: Uint32Array | undefined;  // triangle index
let boxes: Float32Array | undefined;
let bvh: Float32Array | undefined; // [minX, minY, minZ, maxX, maxY, maxZ, centerX, centerY, centerZ]

/**
 * array buffer in-place bvh build
 *
 * @param index 
 * @param position 
 */
export function bvh_build_geometry_indexed(indexBuffer: Uint32Array, positionBuffer: Float32Array): BVH {

  const triangleCount = indexBuffer.length / 3;
  index = new Uint32Array(triangleCount);
  boxes = new Float32Array(triangleCount * BUFFER_STRIDE_BOX);
  bvh = new Float32Array((triangleCount * 2 - 1) * BUFFER_STRIDE_BVH_NODE);

  console.log(`[bvh_build_geometry_indexed] build bvh tree with number of ${triangleCount} triangles`);
  const start = performance.now();

  // compute triangle bounding boxes
  for (let i = 0; i < triangleCount; ++i) {
    // init triangle index
    index[i] = i;

    box.reset();
    for (let j = 0; j < BUFFER_STRIDE_INDEX; ++j) {
      const p = indexBuffer[i * BUFFER_STRIDE_INDEX + j];
      point.read(positionBuffer, p * BUFFER_STRIDE_POSITION);
      box.expandByPoint3(point);
    }
    
    // save triangle box
    const pBox = i * BUFFER_STRIDE_BOX;
    box.write(boxes, pBox);

  }

  bvh_node_count = 0;
  bvh_split_balanced(0, triangleCount);

  const result = new Float32Array(bvh.buffer, 0, bvh_node_count * BUFFER_STRIDE_BVH_NODE);
  boxes = undefined;
  bvh = undefined;

  const duration = performance.now() - start;
  console.log(`[bvh_build_geometry_indexed] bvh build finished, cost ${duration.toFixed(3)}ms`);

  const newIndex = new Float32Array(indexBuffer.length);
  for (let i = 0; i < triangleCount; ++i)
  {
    const current = i * BUFFER_STRIDE_INDEX;
    const previous = index[i] * BUFFER_STRIDE_INDEX;
    newIndex[current] = indexBuffer[previous];
    newIndex[current + 1] = indexBuffer[previous + 1];
    newIndex[current + 2] = indexBuffer[previous + 2];
  }

  return { nodes: result!, index: newIndex, count: bvh_node_count } as BVH;
}

export function bvh_build_geometry(position: Float32Array) {
  // TODO
}

function bvh_box_longest_axis(box: Box3): number {
  const size = box.size;
  const max = size.max_element();
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

function bvh_save_leaf_node(i: number): void {
  node.box.read(boxes!, index![i] * BUFFER_STRIDE_BOX);
  node.index = i;
  node.count = 0;
  node.axis = axis;
  node.write(bvh!, bvh_node_count * BUFFER_STRIDE_BVH_NODE);
  bvh_node_count++;
}

/**
 * in-place bvh split algorithm
 */
function bvh_split_balanced(from: number, to: number): number {

  if (to - from === 1) {
    bvh_save_leaf_node(from);
    return 1;
  }

  if (to - from === 2)
  {
    bvh_save_leaf_node(from);
    bvh_save_leaf_node(to - 1);
    return 2;
  }

  node.box.reset();
  for (let i = from; i < to; ++i) {
    box.read(boxes!, index![i] * BUFFER_STRIDE_BOX);
    node.box.expandByBox3(box);
  }

  // find longest axis
  axis = bvh_box_longest_axis(node.box);
  QuickSort(index, from, to, bvh_node_compare_func_axis);

  const node_index = bvh_node_count;
  node.axis = axis;
  node.index = from;
  node.write(bvh!, bvh_node_count * BUFFER_STRIDE_BVH_NODE);
  bvh_node_count++;

  const pivot = (from + (to - from) * 0.5) | 0;
  const left = bvh_split_balanced(from, pivot);
  const right = bvh_split_balanced(pivot, to);
  const count = left + right;

  // write children count
  bvh![node_index * BUFFER_STRIDE_BVH_NODE + BUFFER_OFFSET_BVH_COUNT] = count;

  return count;
}

function bvh_split_sah() {
  // TODO
}