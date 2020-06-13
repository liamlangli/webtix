#ifndef stdlib
#define stdlib

#define EPSILON 1e-6
#define MAX_RAY_DISTANCE 1e10
#define PI 3.141592653
#define Naturn_E 2.718281828

struct ray {
  vec3 origin, direction;
};

struct texture_buffer_layout {
  float width, height, count, stride;
};

float min_element(vec3 v) {
  return min(v.x, min(v.y, v.z));
}

float max_element(vec3 v) {
  return max(v.x, max(v.y, v.z));
}

bool contain(const vec3 v, const vec3 b, const vec3 t) {
  return dot(step(b, v), step(v, t)) >= 3.0;
}

float box_intersect(const vec3 minV, const vec3 maxV, const ray r) {
  vec3 orig = r.origin;
  vec3 dir = r.direction;

  if (contain(orig, minV, maxV)) {
    return 0.0;
  }

  vec3 invDir = 1.0 / dir;

  vec3 bmin = (minV - orig) * invDir;
  vec3 bmax = (maxV - orig) * invDir;

  vec3 near = min(bmin, bmax);
  vec3 far = max(bmin, bmax);

  float t_n = max(near.x, max(near.y, near.z));
  float t_f = min(far.x, min(far.y, far.z));

  if(t_f < 0.0 || t_n > t_f) {
    return -1.0;
  }

  return t_n;
}

float rand(const vec2 i){
  return fract(sin(dot(i.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

vec3 linear_to_srgb(vec3 i) {
  return mix(pow(i, vec3(0.41666)) * 1.055 - vec3(0.055), i * 12.92, vec3(lessThanEqual(i, vec3(0.0031308))));
}

vec3 rand_hammersley_cos(const vec3 n, float index, const float count, const float offset)
{
  uint i = uint(index);
  float x = index / count;
  i = (i << 16u) | (i >> 16u);
  i = ((i & 0x55555555u) << 1u) | ((i & 0xAAAAAAAAu) >> 1u);
  i = ((i & 0x33333333u) << 2u) | ((i & 0xCCCCCCCCu) >> 2u);
  i = ((i & 0x0F0F0F0Fu) << 4u) | ((i & 0xF0F0F0F0u) >> 4u);
  i = ((i & 0x00FF00FFu) << 8u) | ((i & 0xFF00FF00u) >> 8u);
  vec2 r = vec2(x, (float(i) * 2.32830643653086963e-10 * 6.2831) + offset);
  vec3 uu = normalize(cross(n, vec3(1.0, 1.0, 0.0))), vv = cross(uu, n);
  float sqrtx = sqrt(r.x);
  return normalize(vec3(sqrtx * cos(r.y) * uu + sqrtx * sin(r.y) * vv + sqrt(1.0 - r.x) * n));
}

#endif