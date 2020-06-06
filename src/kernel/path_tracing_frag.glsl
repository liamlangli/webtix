#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

// uniforms
uniform mat4 view_matrix;

// [originX, originY, orginZ, fov]
uniform vec4 camera_data;

// input & output
in vec2 uv;
out vec4 color;

#include <stdlib>
#buffer <index>
#buffer <bvh>
#buffer <position>
#buffer <normal>
#include <primitive>
#include <trace>

// global variables
void main()
{
  float fov = camera_data.w;
  vec3 origin = camera_data.xyz;
  vec3 tardiget = (view_matrix * vec4(uv, atan(fov), 1.0)).xyz;
  vec3 direction = ;
  ray r = ray(origin, normalize(target));

  trace_result result;

  // start tracing 
  bool hit = trace(r, result);
  color = vec4(vec3(float(hit)), 1.0);
}