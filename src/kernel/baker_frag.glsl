#version 300 es
precision highp float;

in vec3 v_normal;
in vec3 v_position;

out vec4 color[2];

void main() {
  color[0] = vec4(v_normal, 1.0);
  color[1] = vec4(v_position, 1.0);
}