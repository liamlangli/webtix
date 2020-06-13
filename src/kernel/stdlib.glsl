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

float radical_inverse(uint i) {
  i = (i << 16u) | (i >> 16u);
  i = ((i & 0x55555555u) << 1u) | ((i & 0xAAAAAAAAu) >> 1u);
  i = ((i & 0x33333333u) << 2u) | ((i & 0xCCCCCCCCu) >> 2u);
  i = ((i & 0x0F0F0F0Fu) << 4u) | ((i & 0xF0F0F0F0u) >> 4u);
  i = ((i & 0x00FF00FFu) << 8u) | ((i & 0xFF00FF00u) >> 8u);
  return float(i) * 2.32830643653086963e-10 + fract(rand(uv));
}

vec3 hemisphere_sample_cos(const vec3 n, vec2 coord) {
  float phi = coord.y * 2.0 * PI;
  float cos_theta = sqrt(1.0 - coord.x);
  float sin_theta = sqrt(1.0 - cos_theta * cos_theta);

  vec3 left = normalize(cross(n, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(left, n);

  return normalize(cos(phi) * sin_theta * left + sin(phi) * sin_theta * up + cos_theta * n);
}

vec3 hammersley_sample_cos(const vec3 n, float i, float count) {
  return hemisphere_sample_cos(n, vec2(i / count, radical_inverse(uint(i))));
}

#endif