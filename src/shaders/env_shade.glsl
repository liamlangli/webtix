#ifndef env_shade
#define env_shade

const float skyBoxScale = 100.0;
const vec3 skyBoxMin = vec3(-skyBoxScale, -4.0 * skyBoxScale, -skyBoxScale);
const vec3 skyBoxMax = vec3(skyBoxScale,-2.0 * skyBoxScale, skyBoxScale);

vec4 hitSkyBox(const vec3 dir, const vec3 orig) {
    if( !contain(orig, skyBoxMin, skyBoxMax) ){
        return vec4(0.0);
    }
    vec3 invDir = 1.0 / dir;

    vec3 bmin = (skyBoxMin - orig) * invDir;
    vec3 bmax = (skyBoxMax - orig) * invDir;

    vec3 near = min(bmin, bmax);
    vec3 far = max(bmin, bmax);

    float ext_n = max(near.x, max(near.y, near.z));
    float ext_f = min(far.x, min(far.y, far.z));
    if(ext_f < 0.0 || ext_n > ext_f) {
        return vec4(0.0);
    }

    vec3 hit = origin + ext_n * dir;

    return vec4(hit, 1.0);
}


const vec3 skyColor = vec3(0.318, 0.471, 0.624);
const vec3 groundColor = vec3(0.619, 0.607, 0.564);
const vec3 up = vec3(0.0, 1.0, 0.0);

vec3 envShade(const vec3 dir, const vec3 orig) {

    vec3 sampleDir = dir;
    vec4 pos = hitSkyBox(dir, orig);
    if(pos.w > 0.0) {
        sampleDir = normalize(skyBoxMin * 0.5 + skyBoxMax * 0.5 - pos.xyz);
    }
  
    return mix(
        groundColor + (skyColor - groundColor) * exp(dot(normalize(sampleDir), up)),
        1.0 * textureLod(envmap, vec2(1.0 - (PI + atan(sampleDir.z, sampleDir.x) / (2.0 * PI)), acos(sampleDir.y) / PI), 0.0).rgb,
        useEnvmap
    );
}

#endif