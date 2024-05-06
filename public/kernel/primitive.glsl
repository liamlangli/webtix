#ifndef primitive_kernel
#define primitive_kernel

struct primitive_block {
  vec3 p0, p1, p2, n0, n1, n2;
};

struct primitive_intersection {
  float t, u, v;
};

primitive_block fetch_primitive(const float index) {
  vec3 indices = fetch_index(index);

  vec3 p0 = fetch_position(indices.x);
  vec3 p1 = fetch_position(indices.y);
  vec3 p2 = fetch_position(indices.z);

  vec3 n0 = fetch_normal(indices.x);
  vec3 n1 = fetch_normal(indices.y);
  vec3 n2 = fetch_normal(indices.z);

  return primitive_block(p0, p1, p2, n0, n1, n2);
}

vec3 primitive_centriod_normal(const primitive_block p, const float u, const float v) {
  return normalize(p.n0 * (1.0 - u - v) + p.n1 * u + p.n2 * v);
}

/**
 * double-sided triangle primitive intersect
 **/
primitive_intersection primitive_intersect(const primitive_block block, const ray r) {
  vec3 v1, v2, P, T, Q, orig, dir;
  primitive_intersection result;

  orig = r.origin;
  dir = r.direction;
  v2 = block.p1 - block.p0;
  v1 = block.p2 - block.p0;
  result = primitive_intersection(-1.0, 0.0, 0.0);
  
  P = cross(dir, v2);
  float det = dot(v1, P);   //carmer rules devider
  if (det > -EPSILON && det < EPSILON)
    return result;

  T = orig - block.p0;
  float invdet = 1.0 / det;

  float u = dot(T, P) * invdet;
  if (u < 0.0 || u > 1.0)
    return result;

  Q = cross(T, v1);
  float v = dot(dir, Q) * invdet;
  if (v < 0.0 || u + v > 1.0)
    return result;

  float t = dot(v2, Q) * invdet;
  if (t > 0.0) {
    return primitive_intersection(t, u, v);
  }
  return result;
}

#endif