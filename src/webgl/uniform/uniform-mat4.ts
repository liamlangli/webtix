import { Uniform } from "./uniform";
import { Matrix4 } from "../../math/mat4";
import { GPUPipeline } from "../pipeline";

export class UniformMatrix4 implements Uniform {
    constructor(
        public name: string,
        public matrix: Matrix4,
    ) {}

    location?: WebGLUniformLocation | undefined;

    upload(pipeline: GPUPipeline): void {
        const gl = pipeline.device.getContext<WebGL2RenderingContext>();
        gl.uniformMatrix4fv(this.location!, false, this.matrix.elements);
    }
}
