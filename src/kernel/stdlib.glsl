#ifndef stdlib
#define stdlib

#define EPSILON 1e-6
#define MAX_RAY_DISTANCE 1e10
#define PI 3.141592653
#define PI2 6.28318530718
#define Naturn_E 2.718281828
#define PI_INV 0.31830988618
#define PI2_INV 0.15915494309

float random_seed;

struct ray {
  vec3 origin, direction;
};

vec3 ray_extend(const ray r, const float t) {
  return r.origin + r.direction * t;
}

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

#define lerp(a, b, t) (a + (b - a) * t)

float square(float a) {
  return a * a;
}

vec3 face_normal(const vec3 normal, const vec3 view) {
  return dot(normal, view) > 0.0 ? normal : -normal;
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

// stable random func
float rand(const vec2 i){
  return fract(sin(dot(i, vec2(12.9898,78.233))) * 43758.5453);
}

float rand_unstable(const vec2 i) {
  return fract(sin(dot(i.yx + random_seed - .5, vec2(12.9898,78.233))) * 43758.5453);
}

vec3 linear_to_srgb(vec3 i) {
  return mix(pow(i, vec3(0.41666)) * 1.055 - vec3(0.055), i * 12.92, vec3(lessThanEqual(i, vec3(0.0031308))));
}

float luminance(vec3 c) {
  return dot(c, vec3(0.299, 0.587, 0.114));
}

vec3 tonemapping_aces(vec3 i)
{
  const float A = 2.51;
  const float B = 0.03;
  const float C = 2.43;
  const float D = 0.59;
  const float E = 0.14;
  return (i * (A * i + B)) / (i * (C * i + D) + E);
}

float radical_inverse(uint i) {
  i = (i << 16u) | (i >> 16u);
  i = ((i & 0x55555555u) << 1u) | ((i & 0xAAAAAAAAu) >> 1u);
  i = ((i & 0x33333333u) << 2u) | ((i & 0xCCCCCCCCu) >> 2u);
  i = ((i & 0x0F0F0F0Fu) << 4u) | ((i & 0xF0F0F0F0u) >> 4u);
  i = ((i & 0x00FF00FFu) << 8u) | ((i & 0xFF00FF00u) >> 8u);
  return float(i) * 2.32830643653086963e-10 + fract(rand(v_uv));
}

vec3 hemisphere_sample_cos(const vec3 n, vec2 coord) {
  float phi = coord.y * 2.0 * PI;
  float cos_theta = sqrt(1.0 - coord.x);
  float sin_theta = sqrt(1.0 - cos_theta * cos_theta);

  vec3 left = normalize(cross(n, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(left, n);

  return normalize(cos(phi) * sin_theta * left + sin(phi) * sin_theta * up + cos_theta * n);
}

vec3 hemisphere_sample_uniform(const vec3 n, vec2 coord) {
  float phi = coord.y * 2.0 * PI;
  float cos_theta = 1.0 - coord.x;
  float sin_theta = sqrt(1.0 - cos_theta * cos_theta);

  vec3 left = normalize(cross(n, vec3(0.0, 1.0, 0.0)));
  vec3 up = cross(left, n);

  return normalize(cos(phi) * sin_theta * left + sin(phi) * sin_theta * up + cos_theta * n);
}

vec2 hammersley_sample_2d(float i, float count) {
  return vec2(1.0 - i / count, radical_inverse(uint(i)));
}

vec3 hammersley_sample_cos(const vec3 n, const float i, const float count) {
  return hemisphere_sample_cos(n, vec2(1.0 - i / count, radical_inverse(uint(i))));
}

vec3 hammersley_sample_uniform(const vec3 n, const float i, const float count) {
  return hemisphere_sample_uniform(n, vec2(1.0 - i / count, radical_inverse(uint(i))));
}


#endif