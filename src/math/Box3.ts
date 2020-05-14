/**
 * axes align bounding box
 */

import { Vector3 } from "./vector3";

export class Box3 {

  public minV: Vector3 = new Vector3(Infinity, Infinity, Infinity);
  public maxV: Vector3 = new Vector3(-Infinity, -Infinity, -Infinity);
  public center: Vector3 = new Vector3(0, 0, 0);

  constructor(min?: Vector3, max?: Vector3) {
    if (min !== undefined) {
      this.minV.copy(min);
    }
    if (max !== undefined) {
      this.maxV.copy(max);
    }
    this.computeCenter();
  }

  computeCenter(): Vector3 {
    return this.center.copy(this.minV.clone().mult(0.5).add(this.maxV.clone().mult(0.5)));
  }

  append(b: Box3): Box3 {
    this.minV.min(b.minV);
    this.maxV.max(b.maxV);
    this.computeCenter();
    return this;
  }

  clone(): Box3 {
    return new Box3(this.minV, this.maxV);
  }

}

