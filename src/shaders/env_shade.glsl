#ifndef env_shade
#define env_shade

const vec3 skyColor = vec3(0.318, 0.471, 0.624);
const vec3 groundColor = vec3(0.619, 0.607, 0.564);
const vec3 up = vec3(0.0, 1.0, 0.0);

vec3 envShade(const vec3 dir, const vec3 orig) {

    vec3 sampleDir = dir;

    vec4 pos = projectGround(dir, orig);
    if(pos.w > 0.0) {
        vec3 hit = pos.xyz;
        // sampleDir = -normalize(hit);
        return textureLod(envmap, vec2(hit.x, hit.z) / groundScale, 0.0).rgb;
    }
        
    return mix(
        groundColor + (skyColor - groundColor) * exp(dot(normalize(sampleDir), up)),
        1.0 * textureLod(envmap, vec2(1.0 - (PI + atan(sampleDir.z, sampleDir.x) / (2.0 * PI)), acos(sampleDir.y) / PI), 0.0).rgb,
        useEnvmap
    );
}

#endif