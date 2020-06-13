#version 300 es
precision lowp float;
precision lowp sampler2D;

uniform sampler2D history;
uniform sampler2D frame;

// [frame_index, sample_count, -1, -1]
uniform vec4 frame_status;

in vec2 uv;
out vec4 color;

void main()
{
  float index = frame_status.x;
  color = mix(texture(frame, uv), texture(history, uv), 1.0 / index);
}