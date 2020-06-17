import * as stdlib_kernel from '../kernel/stdlib.glsl';
import * as primitive_kernel from '../kernel/primitive.glsl';
import * as trace_kernel from '../kernel/trace.glsl';
import * as ray_generate_kernel from '../kernel/ray_generate.glsl';
import * as ray_closest_hit_kernel from '../kernel/ray_closest_hit.glsl';
import * as ray_missed_kernel from '../kernel/ray_missed.glsl';
import * as material_kernel from '../kernel/material.glsl';
import { KERNEL_RAY_GENERATE, KERNEL_RAY_CLOSEST_HIT, KERNEL_RAY_MISSED } from '../constants';

const bucket = new Map<string, any>();

bucket.set('stdlib', stdlib_kernel);
bucket.set('primitive', primitive_kernel);
bucket.set('trace', trace_kernel);
bucket.set('material', material_kernel);
bucket.set(KERNEL_RAY_GENERATE, ray_generate_kernel);
bucket.set(KERNEL_RAY_CLOSEST_HIT, ray_closest_hit_kernel);
bucket.set(KERNEL_RAY_MISSED, ray_missed_kernel);

export class ShaderLib {

  public static get(name: string): string {
    return bucket.get(name);
  }

  public static set(name: string, value: string): void {
    bucket.set(name, value);
  }

}
