import { BufferArray } from '../types';
import { Spherical } from './spherical';

export class Vector3 {

  public x: number = 0;
  public y: number = 0;
  public z: number = 0;

  constructor(x?: number, y?: number, z?: number) {
    this.x = x !== undefined ? x : 0;
    this.y = y !== undefined ? y : 0;
    this.z = z !== undefined ? z : 0;
  }

  min(v: Vector3): Vector3 {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
    this.z = Math.min(this.z, v.z);
    return this;
  }

  max(v: Vector3): Vector3 {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
    this.z = Math.max(this.z, v.z);
    return this;
  }

  add(v: Vector3): Vector3 {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  sub(v: Vector3): Vector3 {
    this.x -= v.x;
    this.y -= v.y;
    this.z -= v.z;
    return this;
  }

  mult(scalar: number) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  dot(v: Vector3): number {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  mag(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  len(): number {
    return Math.sqrt(this.mag());
  }

  normalize(): Vector3 {
    return this.mult(1.0 / this.len());
  }

  cross(v: Vector3): Vector3 {
    return this.cross_vector(this, v);
  }

  cross_vector(a: Vector3, b: Vector3): Vector3 {
    return this.set(a.y * b.z - a.z * b.y, a.x * b.z - a.z * b.x, a.x * b.y - a.y * b.x);
  }

  distance(v: Vector3): number {
    const delta_x = this.x - v.x;
    const delta_y = this.y - v.y;
    const delta_z = this.z - v.z;
    return Math.sqrt(delta_x * delta_x + delta_y * delta_y + delta_z * delta_z);
  }

  set(x: number, y: number, z: number): Vector3 {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  copy(v: Vector3): Vector3 {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  min_element(): number {
    return Math.min(this.x, Math.min(this.y, this.z));
  }

  max_element(): number {
    return Math.max(this.x, Math.max(this.y, this.z));
  }

  from_spherical(s: Spherical): Vector3 {
    const sinRadius = Math.sin(s.theta) * s.radius;
    this.x = sinRadius * Math.sin(s.phi);
    this.y = Math.cos(s.theta) * s.radius;
    this.z = sinRadius * Math.cos(s.phi);
    return this;
  }

  read(buffer: BufferArray, offset: number = 0): Vector3 {
    this.x = buffer[offset];
    this.y = buffer[offset + 1];
    this.z = buffer[offset + 2];
    return this;
  }

  write(buffer: BufferArray, offset: number = 0): Vector3 {
    buffer[offset] = this.x;
    buffer[offset + 1] = this.y;
    buffer[offset + 2] = this.z;
    return this;
  }
}

export type Point3 = Vector3;