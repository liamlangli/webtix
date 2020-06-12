import * as stdlib_kernel from '../kernel/stdlib.glsl';
import * as primitive_kernel from '../kernel/primitive.glsl';
import * as trace_kernel from '../kernel/trace.glsl';
import * as light_kernel from '../kernel/light.glsl';
import * as env_shade_kernel from '../kernel/env_shade.glsl';

const bucket = new Map<string, any>();

bucket.set('stdlib', stdlib_kernel);
bucket.set('primitive', primitive_kernel);
bucket.set('trace', trace_kernel);
bucket.set('light', light_kernel);
bucket.set('env_shade', env_shade_kernel);

export class ShaderLib {

  public static request(name: string): string {
    return bucket.get(name);
  }

}
