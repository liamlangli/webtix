#ifndef light_block
#define light_block

const float ambientFactor = 0.02;

struct lightBlock {
  vec3 position, color;
  float power;
};

#endif
