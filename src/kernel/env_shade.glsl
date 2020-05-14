#ifndef env_shade
#define env_shade

const vec3 groundNormal = vec3(0.0, 1.0, 0.0);
const float groundOffset = 0.0;

const vec3 skyColor = vec3(0.318, 0.471, 0.624);
const vec3 groundColor = vec3(0.619, 0.607, 0.564);
const vec3 up = vec3(0.0, 1.0, 0.0);

vec3 envShade(const vec3 dir, const vec3 orig) {
  vec3 sampleDir = dir;
  if (dir.y < 0.0) {
    float factor = dot(groundNormal, dir);
    float t = -( dot(orig, groundNormal) + groundOffset) / factor;
    vec3 hit = orig + dir * t;
    if(test(hit, sun.position + sunShake - hit)) {
      return vec3(0.1);
    }
    sampleDir = hit;
    return vec3(0.7);
  }

  return groundColor + (skyColor - groundColor) * exp(dot(normalize(sampleDir), up));
}

#endif