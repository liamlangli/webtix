import { Vector3 } from '../math/vector3';
import { Matrix4 } from '../math/mat4';

export class Camera {

  up: Vector3 = new Vector3(0, 1, 0);
  position: Vector3 = new Vector3();
  forward: Vector3 = new Vector3();

  constructor(public fov: number, public aspect: number) {}

  look_at(target: Vector3): void {
    this.forward.copy(target).sub(this.position).normalize();
  }

  write(buffer: Float32Array, offset: number = 0): void {
    this.position.write(buffer, offset);
    this.forward.write(buffer, offset + 4);
    this.up.write(buffer, offset + 8);
    buffer[offset + 12] = this.fov;
  }

}