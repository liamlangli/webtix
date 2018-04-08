#version 300 es

#define POSITION_LOCATION 0

precision highp float;
precision highp int;

uniform mat4 MVP;

layout(location = POSITION_LOCATION) in vec3 position;

out vec3 origin;

void main()
{
    origin = ( MVP * vec4(0.0, 0.0, 0.0, 1.0) ).xyz;
    gl_Position = vec4( position, 1.0 );
}