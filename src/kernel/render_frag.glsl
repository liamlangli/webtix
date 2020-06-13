#version 300 es
precision lowp float;
precision lowp sampler2D;

uniform sampler2D frame;

uniform float index;

in vec2 uv;
out vec4 color;

#include <stdlib>

void main()
{
  color = vec4(linear_to_srgb(texture(frame, uv).rgb), 1.0);
}