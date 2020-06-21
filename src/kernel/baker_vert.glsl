#version 300 es
precision highp float;

layout(location = 0) vec3 position;
layout(location = 1) vec3 normal;
layout(location = 2) vec2 texcoord;

out vec3 v_normal;
out vec3 v_position;

void main()
{
  v_normal = normal;
  v_position = position;

  gl_Position = vec4(texcoord * 2.0 - 1.0, 0.0, 1.0);
}