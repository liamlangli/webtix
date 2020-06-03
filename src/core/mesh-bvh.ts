
import { Box3 } from '../math/box3';
import { QuickSort } from '../utils/quicksort';
import { Vector3 } from '../math/vector3';

// class BVHNode {
//   box: Box3;
//   leftIndex: number;
//   rightIndex: number;
//   left: BVHNode;
//   right: BVHNode;
//   axis: number;
// }

// class NodeInfo {
//   childCount: number = 0;
//   buffer: number[] = [];

//   appendBuffer(buffer: number[]): number[] {
//     this.buffer = this.buffer.concat(buffer);
//     return this.buffer;
//   }
// }

// /**
//  * Mesh BVH
//  * prefer build bvh on worker
//  */
// export class MeshBVH {

//   private split(primitives: Primitive[], left: number, right: number): BVHNode {

//     const leftIndex = left;
//     const rightIndex = right;

//     let box = new Box3();

//     for (let i = left; i < right; ++i) {
//       const p = primitives[i];
//       box.append(p.box);
//     }

//     const box = box;
//     const axis = LongestAxis(box);

//     const compareFn = (pa: Primitive, pb: Primitive) => {
//       return pa.box.center.elements()[node.axis] - pb.box.center.elements()[node.axis];
//     };

//     if (right - left < 3) {
//       QuickSort(primitives, left, right, compareFn);
//       return node;
//     }

//     QuickSort(primitives, left, right, compareFn);

//     const pivot = (left + (right - left) / 2) | 0;

//     if (left < right - 1) {
//       node.left = this.split(primitives, left, pivot);
//       node.right = this.split(primitives, pivot, right);
//     }

//     return node;
//   }
// }
const BUFFER_STRIDE_POINT = 3;
const BUFFER_STRIDE_BOX = 6;

// temp object
const box = new Box3();
const point = new Vector3();

export class BVHBuilder {

  constructor() {}

}

export function bvh_build_geometry_indexed(index: Uint32Array, position: Float32Array)
  : Float32Array {
  const triangleCount = index.length / 3;
  const newIndex = new Uint32Array(index);
  const boxes = new Float32Array(triangleCount * 6);
  const bvh = new Float32Array(triangleCount * 2 - 1);

  // compute triangle bounding boxes
  for (let i = 0; i < triangleCount; ++i) {

    box.reset();
    for (let j = 0; j < BUFFER_STRIDE_POINT; ++j) {
      const pTriangle = newIndex[i * BUFFER_STRIDE_POINT + j];
      point.read(position, pTriangle * BUFFER_STRIDE_POINT);
      box.expandByPoint3(point);
    }

    const pBox = i * BUFFER_STRIDE_BOX;
    box.write(boxes, pBox);

  }

  bvh_split_balanced(newIndex, bvh, boxes, 0, triangleCount, 0);

  return new Float32Array(bvh);
}

export function bvh_build_geometry(position: Float32Array) {
  // TODO
}

/**
 * in-place bvh split algorithm
 */
function bvh_split_balanced(
  index: Uint32Array, bvh: Float32Array, boxes: Float32Array,
  from: number, to: number, depth: number): void {

  

}

function bvh_split_sah() {

}