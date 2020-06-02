
import { Box3 } from '../math/box3';
import { QuickSort } from '../utils/quicksort';

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

export function bvh_build_geometry_indexed(index: Uint32Array, position: Float32Array): Float32Array {
  const triangleCount = index.length / 3;
  const bvh: number[] = [];

  // compute triangle bounding boxes
  const boxes = new Float32Array(triangleCount * 6);

  return new Float32Array(bvh);
}

export function bvh_build_geometry(position: Float32Array): void {
  // TODO
}

function bvh_split_balanced(): void {}

function bvh_split_sah(): void {}