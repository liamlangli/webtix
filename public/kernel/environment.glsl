#ifndef environment_kernel
#define environment_kernel

uniform sampler2D environment;

/**
 * https://community.khronos.org/t/creating-texture-from-hdr-image/66677/5
 **/

vec3 sample_environment(vec3 n) {
    return texture(environment, vec2(atan(n.z, n.x) * PI_INV * 0.5 + 0.5, asin(-n.y) * PI_INV + 0.5)).rgb;
}

#endif