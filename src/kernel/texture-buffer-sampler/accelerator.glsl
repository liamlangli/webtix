#ifndef accelerator_request
#define accelerator_request

uniform sampler2D accelerator;
uniform vec3 acceleratorInfo;  
const float acceleratorGap = 3.0;

struct accelerateBlock {
  vec3 minV, maxV, info;
};

accelerateBlock requestAccelerateBlock(const float index) {
  float scalar = index / acceleratorInfo.y;
  float row = floor(scalar) / acceleratorInfo.z;
  float column = fract(scalar);
  vec2 pos = vec2(0.0001) + vec2(column, row);
  vec3 minV = textureLod(accelerator, pos, 0.0).rgb;
  vec3 maxV = textureLodOffset(accelerator, pos, 0.0, ivec2(1, 0)).rgb;
  vec3 info = textureLodOffset(accelerator, pos, 0.0, ivec2(2, 0)).rgb;
  return accelerateBlock(minV, maxV, info);
}

#endif