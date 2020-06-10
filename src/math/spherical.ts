import { Vector3 } from "./vector3";
import { math_clamp } from "./math-utils";

export class Spherical {

  radius: number;
  theta: number;
  phi: number;

  constructor(radius?: number, theta?: number, phi?: number) {
    this.radius = radius || 1;
    this.theta = theta || 0;
    this.phi = phi || 0;
  }

  from_vector3(v: Vector3): Spherical {
    this.radius = v.len();
    if (this.radius === 0) {
      this.theta = 0;
      this.phi = 0;
    } else {
      this.theta = Math.acos(math_clamp((v.y / this.radius), -1, 1));
      this.phi = Math.atan2(v.x, v.z);
    }
    return this;
  }

  set(radius: number, theta: number, phi: number): Spherical {
    this.radius = radius;
    this.theta = theta;
    this.phi = phi;
    return this;
  }

  copy(s: Spherical): Spherical {
    return this.set(s.radius, s.theta, s.phi);
  }

  clone(): Spherical {
    return new Spherical(this.radius, this.theta, this.phi);
  }

}
