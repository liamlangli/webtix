#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;

#define EPSILON 0.000001

uniform mat4 MVP, proj;
uniform float inseed;
uniform int incount;
uniform vec2 resolution;

uniform sampler2D verties;

in vec3 origin;
out vec4 color;

float seed;
uint N = 128u;
uint i;


float random_ofs = 0.0;
vec3 cosWeightedRandomHemisphereDirectionHammersley(const vec3 n)
{
    float x = float(i) / float(N);
    i = (i << 16u) | (i >> 16u);
    i = ((i & 0x55555555u) << 1u) | ((i & 0xAAAAAAAAu) >> 1u);
    i = ((i & 0x33333333u) << 2u) | ((i & 0xCCCCCCCCu) >> 2u);
    i = ((i & 0x0F0F0F0Fu) << 4u) | ((i & 0xF0F0F0F0u) >> 4u);
    i = ((i & 0x00FF00FFu) << 8u) | ((i & 0xFF00FF00u) >> 8u);
    vec2 r = vec2(x, (float(i) * 2.32830643653086963e-10 * 6.2831) + random_ofs);
    vec3 uu = normalize(cross(n, vec3(1.0, 1.0, 0.0))), vv = cross(uu, n);
    float sqrtx = sqrt(r.x);
    return normalize(vec3(sqrtx * cos(r.y) * uu + sqrtx * sin(r.y) * vv + sqrt(1.0 - r.x) * n));
}

vec4 trace( vec3 o, vec3 dir ) {

    i = uint(incount);

    float mint = 1000000.0;
    vec2 pos = vec2(0.0);
    vec3 v0, v1, v2;
    v0 = textureLod( verties, pos, 0.0).rgb;
    v1 = textureLodOffset( verties, pos, 0.0, ivec2(1, 0) ).rgb;
    v2 = textureLodOffset( verties, pos, 0.0, ivec2(2, 0) ).rgb;

    vec3 P = cross( dir, v2 );
    float det = dot( v1, P );
    if ( det > -EPSILON ) return vec4(0.0);

    vec3 T = o - v0;
    float invdet = 1.0 / det;
    float u = dot( T, P ) * invdet;
    if ( u < 0.0 || u > 1.0 ) return vec4(0.0);

    vec3 Q = cross( T, v1 );
    float v = dot( dir, Q ) * invdet;
    if ( v < 0.0 || u + v > 1.0 ) return vec4(0.0);

    float t = dot( v2, Q ) * invdet;
    if ( t > EPSILON && t < mint ) 
        return vec4(1.0 - u - v, u, v, 1.0);
}

// vec3 getRayDir(vec3 camR, vec3 camU, vec3 camF) {
//     vec2 fc = vec2( gl_FragCoord.xy );
//     vec2 fcu = fc / resolution;
//     seed = inseed + fcu.x + fcu.y;
//     vec2 aa = fract( sin( vec2( seed, seed + 0.1))) * vec2(43758.5453123, 22578.1459123);
//     vec2 uv = (fc) / (resolution / 2.0) - 1.0;

//     return normalize( uv.x * camR + uv.y * camU + camF); 
// }

void main()
{

    // vec3 camR, camU, camF;
    // camR = vec3(1.0, 0.0, 0.0);
    // camU = vec3(0.0, 1.0, 0.0);
    // camF = vec3(0.0, 0.0, 1.0);

    // vec3 dir = getRayDir(camR, camU, camF);
    // vec4 hit = trace( vec3(0.0, 0.0, -1.0), dir);

    vec2 fc = vec2(gl_FragCoord.xy);
    vec2 fcu = fc / resolution;
    seed = inseed + fcu.x + fcu.y;
    vec2 aa = fract( sin(vec2(seed, seed + 0.1)) * vec2(43758.5453123, 22578.1459123) );
    vec4 view = proj * vec4( (fc + aa) / (resolution / 2.0) - 1.0, 0.0, 1.0);
    view = normalize( MVP * vec4(view.xyz / view.w, 0.0) );
    vec3 orig = origin;

    vec4 hit = trace( orig, view.xyz );

    if (hit.w <= 0.0) {
        color.rgb = vec3( 1.0 );
    } else {
        color.rgb = hit.xyz;
    }

    vec3 v0, v1, v2;
    vec2 pos = vec2(0.0);
    v0 = textureLod( verties, pos, 0.0).rgb;
    v1 = textureLodOffset( verties, pos, 0.0, ivec2(1, 0) ).rgb;
    v2 = textureLodOffset( verties, pos, 0.0, ivec2(2, 0) ).rgb;
    // color.rgb = dir;
}