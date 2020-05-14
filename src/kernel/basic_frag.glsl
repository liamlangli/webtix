#version 300 es

precision lowp float;
precision lowp sampler2D;

uniform sampler2D accum;
uniform float count;

out vec4 color;

void main()
{
  color = vec4( sqrt( texelFetch(accum, ivec2(gl_FragCoord.xy), 0).rgba * count ) );
}