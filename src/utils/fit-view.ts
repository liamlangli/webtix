import { Box3, Vector2, Vector3 } from "../math";
import { Camera } from "../core";

// change camera position to view the whole box.
export function fit_view(box: Box3, camera: Camera): void {
    const size = box.size;
    const distance = Math.atan(camera.fov * 0.5) * size.len();
    camera.position.sub(box.center).normalize().mult(distance);
}
