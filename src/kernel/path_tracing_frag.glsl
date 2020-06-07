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
#buffer <bvh>
#buffer <position>
#buffer <normal>
#buffer <index>
#include <primitive>
#include <trace>

// global variables
void main()
{
  float fov = camera_data.w;
  vec3 origin = camera_data.xyz;
  vec3 target = (view_matrix * vec4(uv - 0.5, atan(fov), 1.)).xyz;
  ray r = ray(origin, -normalize(target));

  trace_result result;

  // start tracing 
  bool hit = trace(r, result);
  if (hit) {
    // color = vec4(result.normal, 1.0);
    color = vec4(1.0);
  } else {
    color = vec4(vec3(0.0), 1.0);
    // color = vec4(fetch_normal(2.0) * .5 + .5, 1.);
    // color = vec4(texture(normal_buffer, uv).rgb * .5 + .5, 1.0);
    // color = vec4(texture(position_buffer, uv).rgb + 0.5, 1.0);
  }

  // color = vec4(block.p0, 1.0);
  // color = vec4(texture(normal_buffer, uv).rgb * 0.5 + 0.5, 1.0);
  // color = vec4(texture(position_buffer, uv).rgb, 1.0);
}