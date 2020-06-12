import { GPUPipeline } from "../webgl/pipeline";

export class PathTracePipeline {

  pipeline?: GPUPipeline;

  set_ray_generate_kernel(kernel: string): void {}

  set_closest_hit_kernel(kernel: string): void {}

  compile(): void {}

  execute(): void {}

}