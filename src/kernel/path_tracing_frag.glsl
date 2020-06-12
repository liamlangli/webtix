#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;

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

#include <stdlib>
#buffer <bvh>
#buffer <position>
#buffer <normal>
#buffer <index>
#include <primitive>
#include <trace>

void main()
{
  // ray create
  vec3 origin = position.xyz;
  vec3 X = normalize(cross(forward.xyz, up.xyz));
  vec3 Y = normalize(cross(X, forward.xyz));
  vec3 direction = normalize(forward.xyz * atan(fov) + X * uv.x + Y * uv.y);
  ray r = ray(origin, direction);

  trace_result result;

  // start tracing 
  bool hit = trace(r, result);
  if (hit) {
    color = vec4(result.normal * .5 + .5, 1.0);
  } else {
    color = vec4(direction * 0.5 + 0.5, 1.0);
  }
}