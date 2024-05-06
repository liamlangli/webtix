#version 300 es
precision lowp float;
precision lowp sampler2D;

uniform sampler2D history;
uniform sampler2D frame;

// [frame_index, sample_count, random_seed, -1]
uniform vec4 frame_status;

in vec2 v_uv;
out vec4 color;

void main()
{
  float index = frame_status.x + 1.0;
  color.rgb = clamp(mix(texture(history, v_uv), texture(frame, v_uv), 1.0 / index).xyz, 0.0, 1.0);
  color.a = 1.0;
}