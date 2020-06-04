#ifndef vertex_request
#define vertex_request

uniform sampler2D vertexTexture;

// [count, nRows, nColumns]
uniform vec3 vertexInfo;

vec3 requestVertex(const float index) {
  float scalar = index / vertexInfo.y;
  float row = floor(scalar) / vertexInfo.z;
  float column = fract(scalar);
  vec2 pos = vec2(0.5 / vertexInfo.yz) + vec2(column, row);
  return textureLod(vertexTexture, pos, 0.0).rgb;
}

#endif