#ifndef environment_kernel
#define environment_kernel

vec3 sample_environment(vec3 n) {
  float u = 0.5 + (1.0 * PI_INV) * atan(n.x / -n.z);
  float v = acos(n.y) * PI_INV;
  return texture(environment, vec2(u, v)).rgb;
}

#endif