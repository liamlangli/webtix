#ifndef primitive_request
#define primitive_request

uniform sampler2D primitives;
uniform vec3 primitiveInfo;
const float primitiveGap = 3.0;

struct primitiveBlock {
  vec3 n0, n1, n2, p0, p1, p2;
  float materialIndex;
};

primitiveBlock requestPrimitiveBlock(const float primitiveIndex) {
  float primitiveScalar = primitiveIndex / primitiveInfo.y;
  float primitiveRow = floor(primitiveScalar) / primitiveInfo.z;
  float primitiveColumn = fract(primitiveScalar);

  vec2 facePos = vec2(0.5 / primitiveInfo.yz) + vec2(primitiveColumn, primitiveRow);
  vec3 primitiveInfo0 = textureLod(primitives, facePos, 0.0).rgb;
  vec3 primitiveInfo1 = textureLodOffset(primitives, facePos, 0.0, ivec2(1, 0)).rgb;
  vec3 primitiveInfo2 = textureLodOffset(primitives, facePos, 0.0, ivec2(2, 0)).rgb;

  vec3 p0 = fetch_position(primitiveInfo0.x);
  vec3 p1 = fetch_position(primitiveInfo1.x);
  vec3 p2 = fetch_position(primitiveInfo2.x);

  vec3 n0 = fetch_normal(primitiveInfo0.y);
  vec3 n1 = fetch_normal(primitiveInfo1.y);
  vec3 n2 = fetch_normal(primitiveInfo2.y);

  return primitiveBlock(n0, n1, n2, p0, p1, p2, primitiveInfo0.z);
}

#endif