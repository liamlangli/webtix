import { Target } from "./target";
import { Color4 } from "../math/color";
import { GPUDevice } from "../device";

export class SwapTarget {
    front: Target;
    back: Target;

    get gl(): WebGL2RenderingContext {
        return this.device.getContext<WebGL2RenderingContext>();
    }

    constructor(
        public device: GPUDevice,
        public width: number,
        public height: number,
    ) {
        this.front = new Target(device, width, height);
        this.back = new Target(device, width, height);
    }

    swap(): void {
        let tmp = this.front;
        this.front = this.back;
        this.back = tmp;
    }

    bind(): void {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.front.frameBuffer);
        gl.viewport(0, 0, this.width, this.height);
    }

    unbind(): void {
        const gl = this.gl;
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    delete() {
        this.front.delete();
        this.back.delete();
    }
}
