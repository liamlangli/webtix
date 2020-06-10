import { Spherical } from "../math/spherical";
import { Vector3 } from "../math/vector3";
import { Vector2 } from "../math/vector2";
import EventHub from "../core/event";
import { GlobalEvent } from "../core/global-event";
import { math_clamp } from "../math/math-utils";

export class SphericalControl {

  spherical: Spherical = new Spherical();
  center: Vector3 = new Vector3();

  target: Vector3 = new Vector3();

  start: Vector2 = new Vector2();
  end: Vector2 = new Vector2();
  delta: Vector2 = new Vector2();

  offset: Vector3 = new Vector3();

  speed: number = 0.01;

  constructor(public element: HTMLCanvasElement) {
    element.addEventListener('mousedown', this.onmousedown, false);
  }

  onmousedown = (event: MouseEvent): void => {
    window.addEventListener('mousemove', this.onmousemove, false);
    window.addEventListener('mouseup', this.onmouseup, false);

    this.start.set(event.clientX, event.clientY);
  }

  onmousemove = (event: MouseEvent): void => {
    this.end.set(event.clientX, event.clientY);
    this.delta.copy(this.end).sub(this.start);

    this.rotate_left(2 * Math.PI * this.delta.x / this.element.clientWidth * this.speed);
    this.rotate_up(2 * Math.PI * this.delta.y / this.element.clientHeight * this.speed);

    this.end.copy(this.start);
    
    this.update();
    EventHub.fire(GlobalEvent.MouseMove);
  }

  onmouseup = (event: MouseEvent): void => {
    window.removeEventListener('mousemove', this.onmousemove);
    window.removeEventListener('mouseup', this.onmouseup);
  }

  rotate_left(angle: number): void {
    this.spherical.phi -= angle;
  }

  rotate_up(angle: number): void {
    this.spherical.theta = math_clamp(this.spherical.theta + angle, 1e-3, Math.PI);
  }

  update(): void {
    this.offset.from_spherical(this.spherical).add(this.center);
    this.target.copy(this.offset);
  }

}