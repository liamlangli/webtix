#ifndef normal_request
#define normal_request

uniform sampler2D normals;
uniform vec3 normalInfo;

vec3 requestNormal(const float index) {
  float scalar = index / normalInfo.y;
  float row = floor(scalar) / normalInfo.z;
  float column = fract(scalar);
  vec2 pos = vec2(0.0001) + vec2(column, row);
  return textureLod(normals, pos, 0.0).rgb;
}

#endif