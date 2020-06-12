import * as stdlib_kernel from '../kernel/stdlib.glsl';
import * as primitive_kernel from '../kernel/primitive.glsl';
import * as trace_kernel from '../kernel/trace.glsl';
import * as light_kernel from '../kernel/light.glsl';
import * as env_shade_kernel from '../kernel/env_shade.glsl';
import * as ray_generate_kernel from '../kernel/ray_generate.glsl';
import * as ray_closest_hit_kernel from '../kernel/ray_closest_hit.glsl';
import * as ray_missed_kernel from '../kernel/ray_missed.glsl';

const bucket = new Map<string, any>();

bucket.set('stdlib', stdlib_kernel);
bucket.set('primitive', primitive_kernel);
bucket.set('trace', trace_kernel);
bucket.set('light', light_kernel);
bucket.set('env_shade', env_shade_kernel);
bucket.set('ray_generate', ray_generate_kernel);
bucket.set('ray_closest_hit', ray_closest_hit_kernel);
bucket.set('ray_missed', ray_missed_kernel);

export class ShaderLib {

  public static request(name: string): string {
    return bucket.get(name);
  }

}
