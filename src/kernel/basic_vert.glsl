#version 300 es

#define POSITION_LOCATION 0

precision lowp float;

layout(location = POSITION_LOCATION) in vec3 position;

void main()
{
  gl_Position = vec4( position, 1.0 );
}