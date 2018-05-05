import * as vertex_glsl from '../shaders/texture_request/vertex.glsl';
import * as normal_glsl from '../shaders/texture_request/normal.glsl';
import * as material_glsl from '../shaders/texture_request/material.glsl';
import * as primitive_glsl from '../shaders/texture_request/primitive.glsl';
import * as accelerator_glsl from '../shaders/texture_request/accelerator.glsl';
import * as light_glsl from '../shaders/light.glsl';
import * as env_shade_glsl from '../shaders/env_shade.glsl';

const bucket = new Map<string, any>();

bucket.set('vertex', vertex_glsl);
bucket.set('normal', normal_glsl);
bucket.set('material', material_glsl);
bucket.set('primitive', primitive_glsl);
bucket.set('accelerator', accelerator_glsl);
bucket.set('light', light_glsl);
bucket.set('env_shade', env_shade_glsl);

export class ShaderBucket {

    public static request(name: string): string {
        return bucket.get(name);
    }

}