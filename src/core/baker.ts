import { GPUPipeline, GPUPipelineDescriptor } from "../webgl";
import { Renderer } from "./renderer";
import * as baker_vert from "../kernel/baker_vert.glsl";
import * as baker_frag from "../kernel/baker_frag.glsl";

/**
 * baker prepared uv space world position & normal direction for path tracing engine.
 */
export class Baker {
    pipeline: GPUPipeline;

    constructor(public renderer: Renderer) {
        const pipeline_descriptor = new GPUPipelineDescriptor();
        pipeline_descriptor.vertexShader = baker_vert as any;
        pipeline_descriptor.fragmentShader = baker_frag as any;

        this.pipeline = renderer.device.createPipeline(pipeline_descriptor);
    }

    execute(): void {
        this.renderer.setPipeline(this.pipeline);
        this.renderer.render();
    }
}
