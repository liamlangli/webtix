#version 300 es
precision lowp float;
precision lowp sampler2D;

uniform sampler2D frame;

uniform float index;

in vec2 uv;
out vec4 color;

void main()
{
  color = texture(frame, uv);
}