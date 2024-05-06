import { Uniform } from "./uniform";
import { GPUTexture } from "../texture";
import { GPUPipeline } from "../pipeline";

export class UniformTexture implements Uniform {
    location?: WebGLUniformLocation | undefined;

    constructor(
        public name: string,
        public texture: GPUTexture,
    ) {}

    set(texture: GPUTexture): void {
        this.texture = texture;
    }

    upload(pipeline: GPUPipeline): void {
        const gl = pipeline.device.getContext<WebGL2RenderingContext>();
        this.texture.activate(pipeline.active_texture_slot);
        gl.uniform1i(this.location!, pipeline.active_texture_slot);

        pipeline.active_texture_slot++;
        if (pipeline.active_texture_slot > pipeline.max_texture_slot) {
            throw "texture slot out of bounds.";
        }
    }
}
