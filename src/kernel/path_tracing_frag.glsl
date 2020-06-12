#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
#constants

// uniforms
layout(std140) uniform Camera {
  vec4 position;
  vec4 forward;
  vec4 up;
  float fov;
};

// input & output
in vec2 uv;
out vec4 color;

bool terminated = false;

#include <stdlib>
#buffer <bvh>
#buffer <position>
#buffer <normal>
#buffer <index>
#include <primitive>
#include <trace>
#include <ray_generate>
#include <ray_closest_hit>
#include <ray_missed>

void main()
{
  // ray create
  ray r;
  trace_result result;
  bool hit;

  r = ray_generate();

  int i;
  for(i = 0; i < TRACE_DEPTH; ++i) {
    // start tracing 
    hit = trace(r, result);
    if (hit) {
      r = ray_closest_hit(r, result);
    } else {
      ray_missed(r);
      return;
    }

    if (terminated) {
      return;
    }
  }
}