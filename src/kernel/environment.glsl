#ifndef environment_kernel
#define environment_kernel

vec3 sample_environment(vec3 n) {
  float theta = atan(n.z / n.x);
  float phi = acos(n.y + 0.5);
  return texture(environment, vec2(theta, phi) * PI_INV + 0.5).rgb;
}

#endif