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

// [frame_index, sample_count, -1, -1]
uniform vec4 frame_status;

// input & output
in vec2 uv;
out vec4 color;

bool terminated = false;
float frame_index, sample_count, random_seed, screen_width;

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

  frame_index = frame_status.x;
  sample_count = frame_status.y;
  random_seed = frame_status.z;
  screen_width = frame_status.w;

  r = ray_generate();

  int i;
  for(i = 0; i < TRACE_DEPTH; ++i) {
    // start tracing 
    hit = trace(r, result);
    if (hit) {
      r = ray_closest_hit(r, result);
    } else {
      ray_missed(r);
      break;
    }

    if (terminated) {
      break;
    }
  }

  color = vec4(linear_to_srgb(color.rgb), color.a);
}