#version 300 es
precision highp float;

layout(location = 0) in vec3 position;

out vec2 v_uv;

void main()
{
  v_uv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position, 1.0);
}