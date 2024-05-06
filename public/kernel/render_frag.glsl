#version 300 es
precision lowp float;
precision lowp sampler2D;

uniform sampler2D frame;

in vec2 v_uv;
out vec4 color;

#include <stdlib>

void main()
{
  color = texture(frame, v_uv);
}