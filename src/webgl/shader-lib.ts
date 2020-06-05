import * as stdlib_glsl from '../kernel/stdlib.glsl';
import * as material_glsl from '../kernel/texture-buffer-sampler/material.glsl';
import * as primitive_glsl from '../kernel/texture-buffer-sampler/primitive.glsl';
import * as accelerator_glsl from '../kernel/texture-buffer-sampler/accelerator.glsl';
import * as light_glsl from '../kernel/light.glsl';
import * as env_shade_glsl from '../kernel/env_shade.glsl';

const bucket = new Map<string, any>();

bucket.set('stdlib', stdlib_glsl);
bucket.set('material', material_glsl);
bucket.set('primitive', primitive_glsl);
bucket.set('accelerator', accelerator_glsl);
bucket.set('light', light_glsl);
bucket.set('env_shade', env_shade_glsl);

export class ShaderLib {

  public static request(name: string): string {
    return bucket.get(name);
  }

}
