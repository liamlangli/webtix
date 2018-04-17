import { Primitive } from '../geometry/Primitive';
import { Box3 } from '../math/Box3';
import { Vector3 } from '../math/Vector3';
import { Accelerator, LongestAxis, QuickSort } from './Accelerator';
import { IndexArray, IndexFloatArray } from '../core/IndexArray';

class BVHNode {
    box: Box3;
    leftIndex: number;
    rightIndex: number;
    left: BVHNode;
    right: BVHNode;
    axis: number;
}

class NodeInfo {
    childCount: number = 0;
    buffer: number[] = [];

    appendBuffer(buffer: number[]): number[] {
        this.buffer = this.buffer.concat(buffer);
        return this.buffer;
    }
}

export class BVH extends Accelerator {
    
    root: BVHNode;

    constructor() {
        super();
    }

    feed(vertices: Float32Array) {
        super.feed(vertices);
    }

    build() {
        this.root = this.split(this.pList, 0, this.pList.length);
    }

    private split(primitives: Primitive[], left: number, right: number):BVHNode {
        
        let node = new BVHNode();
        node.leftIndex = left;
        node.rightIndex = right;

        let box = new Box3();

        for(let i = left; i < right; ++i) {
            const p = primitives[i];
            box.append(p.box);
        }

        node.box = box;
        node.axis = LongestAxis(box);

        if (right - left < 5) {
            return node;
        }

        const compareFn = (pa: Primitive, pb: Primitive) => {
            return pa.box.center.elements()[node.axis] - pb.box.center.elements()[node.axis];
        };

        QuickSort(primitives, left, right, compareFn);

        const pivot = (left + (right - left) / 2) | 0;

        if (left < right - 1) {
            node.left = this.split(primitives, left, pivot);
            node.right = this.split(primitives, pivot, right);
        }

        return node;
    }

    genAccelerateBuffer(): number[] {
        const nodeInfo = this.nodeToBuffer(this.root);
        return nodeInfo.buffer;
    }

    private nodeToBuffer(node: BVHNode): NodeInfo {
        const nodeInfo = new NodeInfo();

        if (node === undefined) {
            return ;
        }

        const min = node.box.minV;
        const max = node.box.maxV;

        nodeInfo.buffer.push(min.x, min.y, min.z);
        nodeInfo.buffer.push(max.x, max.y, max.z);
        nodeInfo.buffer.push(node.leftIndex, node.rightIndex);

        let childBuffer = [];

        if (node.left !== undefined) {
            const leftNodeInfo = this.nodeToBuffer(node.left);
            nodeInfo.childCount += leftNodeInfo.childCount + 1;
            childBuffer = childBuffer.concat(leftNodeInfo.buffer);
        }
        
        if (node.right !== undefined) {
            const rightNodeInfo = this.nodeToBuffer(node.right);
            nodeInfo.childCount += rightNodeInfo.childCount + 1;
            childBuffer = childBuffer.concat(rightNodeInfo.buffer);
        }

        if (node.right === undefined && node.left === undefined) {
            nodeInfo.childCount = 0;
        }

        nodeInfo.buffer.push(nodeInfo.childCount);
        nodeInfo.appendBuffer(childBuffer);

        return nodeInfo;
    }
}