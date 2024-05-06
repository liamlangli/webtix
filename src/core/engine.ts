import { Renderer } from "./renderer";
import { GPUDevice } from "../device";

export class Engine {
    animation_index: number = -1;

    get device(): GPUDevice {
        return this.renderer.device;
    }

    constructor(public renderer: Renderer) {}

    // update state each frame
    protected update(): void {}

    // engine prepare stage
    protected start(): void {}

    protected frame = (time?: number): void => {
        this.animation_index = requestAnimationFrame(this.frame);
    };

    pause(): void {
        cancelAnimationFrame(this.animation_index);
    }

    run = (): void => {
        this.start();
        this.frame();
    };
}
