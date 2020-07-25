#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

#constants

// uniforms
layout(std140) uniform Camera {
  vec4 camera_position;
  vec4 forward;
  vec4 up;
  float fov;
};

const int BSDF_REFLECTED = 1;
const int BSDF_TRANSMITTED = 2;
const int BSDF_SPECULAR = 4;

// input & output
in vec2 v_uv;
out vec4 color;

uniform sampler2D environment;

#include <stdlib>

// [frame_index, sample_count, -1, -1]
uniform vec4 frame_status;
bool terminated = false;
float frame_index, sample_count, screen_width;

// tracing variable
vec3 throughput = vec3(1.0);
vec3 radiance = vec3(0.0);
vec3 ray_absorption = vec3(0.0);
float ray_eta = 1.0;
int ray_type = BSDF_REFLECTED;

#buffer <bvh>
#buffer <position>
#buffer <normal>
#buffer <index>
#buffer <material>
#include <material>
#include <primitive>
#include <trace>
#include <disney>
#include <environment>
#include <ray_generate>
#include <ray_closest_hit>
#include <ray_missed>

material mat;

void main()
{
  color = vec4(vec3(0.0), 1.0);

  frame_index = frame_status.x;
  sample_count = frame_status.y;
  random_seed = frame_status.z;
  screen_width = frame_status.w;

  // ray create
  ray r;
  trace_result result;
  bool hit;

  r = ray_generate();

  int i;
  for(i = 0; i < TRACE_DEPTH; ++i) {
    // start tracing
    hit = trace(r, result, mat);
    if (hit) {
      // invoke cloest hit kernel
      r = ray_closest_hit(r, result, mat);
    } else {
      // if ray doesn't any primitive in scene
      ray_missed(r);
      break;
    }

    if (terminated) {
      break;
    }
  }

  if (mat.transmission > 0.0) {
    ray_missed(r);
  }

  color.rgb = min(color.rgb, 1e3);

#ifdef TONE_MAPPING
  color.rgb = tonemapping_aces(color.rgb);
#endif

  // color = vec4(linear_to_srgb(color.rgb), color.a);

  // color = texture(material_buffer, v_uv);
}