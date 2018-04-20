import { Box3 } from "../math/Box3";
import { Primitive } from "../geometry/Primitive";
import { IndexFloatArray, IndexArray } from "../core/IndexArray";
import { Equals } from "../utils/MathUtil";
import { OBJData, OBJPackage, MTLData } from "../utils/OBJLoader";

export class Accelerator {

    pList: Primitive[] = [];
    objData: OBJData;
    mtlData: MTLData;

    constructor() {
    }

    feed(objPack: OBJPackage) {
        this.objData = objPack.objData;
        this.mtlData = objPack.mtlData;
        for (let i = 0, il = this.objData.faces.length; i < il; ++i) {
            const p = new Primitive(this.objData, i);
            this.pList.push(p);
        }
    }

    build() {
        console.log('Please use Accelerator sub class');
    }

    genAccelerateBuffer(): number[] {
        console.log('Please use Accelerator sub class');
        return [];
    }

    genVertexBuffer(): number[] {
        console.log('Please use Accelerator sub class');
        return [];
    }

    genNormalBuffer(): number[] {
        console.log('Please use Accelerator sub class');
        return [];
    }

    genFaceBuffer(): number[] {
        console.log('Please use Accelerator sub class');
        return [];
    }

    genMaterialBuffer(): number[] {
        console.log('Please use Accelerator sub class');
        return [];
    }

    // deprecated
    // genPrimitiveBuffer(): number[] {
    //     const res = [];
    //     for(let i = 0, il = this.pList.length; i < il; ++i) {
    //         const p = this.pList[i];
    //         const n0 = p.n0;
    //         const n1 = p.n1;
    //         const n2 = p.n2;
    //         const p0 = p.p0;
    //         const p1 = p.p1;
    //         const p2 = p.p2;
    //         res.push(
    //             n0.x, n0.y, n0.z,
    //             n1.x, n1.y, n1.z,
    //             n2.x, n2.y, n2.z,
    //             p0.x, p0.y, p0.z,
    //             p1.x, p1.y, p1.z,
    //             p2.x, p2.y, p2.z
    //         );
    //     }
    //     return res;
    // }

}

export function LongestAxis(box: Box3): number {
    let lenV = box.maxV.clone().sub(box.minV);
    let max = lenV.maxElement();
    if (Equals(max, lenV.x)) {
        return 0;
    } else if (Equals(max, lenV.y)) {
        return 1;
    } else {
        return 2;
    }
}

/** v8 QuickSort 
 * https://github.com/v8/v8/blob/cd43b83bf1cc49b9dc6e6f11596611c9f85d69cc/src/js/array.js
 * 
 * has modified part of code 
 **/
export function InsertionSort(arr, from:number, to:number, comparefn:Function) {
    for (var i = from + 1; i < to; i++) {
        var element = arr[i];
        for (var j = i - 1; j >= from; j--) {
            var tmp = arr[j];
            var order = comparefn(tmp, element);
            if (order > 0) {
                arr[j + 1] = tmp;
            } else {
                break;
            }
        }
        arr[j + 1] = element;
    }
}

export function QuickSort(a, from, to, comparefn: Function) {
    var third_index = 0;
    while (true) {
        // Insertion sort is faster for short arrays.
        if (to - from <= 10) {
            InsertionSort(a, from, to, comparefn);
            return;
        }
        third_index = from + ((to - from) >> 1);
        // Find a pivot as the median of first, last and middle element.
        var v0 = a[from];
        var v1 = a[to - 1];
        var v2 = a[third_index];
        var c01 = comparefn(v0, v1);
        if (c01 > 0) {
            // v1 < v0, so swap them.
            var tmp = v0;
            v0 = v1;
            v1 = tmp;
        } // v0 <= v1.
        var c02 = comparefn(v0, v2);
        if (c02 >= 0) {
            // v2 <= v0 <= v1.
            var tmp = v0;
            v0 = v2;
            v2 = v1;
            v1 = tmp;
        } else {
            // v0 <= v1 && v0 < v2
            var c12 = comparefn(v1, v2);
            if (c12 > 0) {
                // v0 <= v2 < v1
                var tmp = v1;
                v1 = v2;
                v2 = tmp;
            }
        }
        // v0 <= v1 <= v2
        a[from] = v0;
        a[to - 1] = v2;
        var pivot = v1;
        var low_end = from + 1;   // Upper bound of elements lower than pivot.
        var high_start = to - 1;  // Lower bound of elements greater than pivot.
        a[third_index] = a[low_end];
        a[low_end] = pivot;

        // From low_end to i are elements equal to pivot.
        // From i to high_start are elements that haven't been compared yet.
        partition: for (var i = low_end + 1; i < high_start; i++) {
            var element = a[i];
            var order = comparefn(element, pivot);
            if (order < 0) {
                a[i] = a[low_end];
                a[low_end] = element;
                low_end++;
            } else if (order > 0) {
                do {
                    high_start--;
                    if (high_start == i) break partition;
                    var top_elem = a[high_start];
                    order = comparefn(top_elem, pivot);
                } while (order > 0);
                a[i] = a[high_start];
                a[high_start] = element;
                if (order < 0) {
                    element = a[i];
                    a[i] = a[low_end];
                    a[low_end] = element;
                    low_end++;
                }
            }
        }
        if (to - high_start < low_end - from) {
            QuickSort(a, high_start, to, comparefn);
            to = low_end;
        } else {
            QuickSort(a, from, low_end, comparefn);
            from = high_start;
        }
    }
};