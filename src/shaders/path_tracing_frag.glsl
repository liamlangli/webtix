#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;

#define EPSILON 0.000001

uniform mat4 MVP, proj;
uniform float inseed;
uniform int incount;
uniform vec2 resolution;
uniform vec3 BBmin;
uniform vec3 BBmax;

uniform float size;
uniform sampler2D verties;

in vec3 origin;
out vec4 color;

float seed;
uint N = 128u;
uint i;

int iSize;

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

vec4 trace(inout vec3 orig, vec3 dir) {

    float mint = 1e10;
    vec2 minpos, minuv;
    vec2 pos = vec2(0.0001);
    vec3 v0, v01, v02;
    vec3 realori = orig;

    for(int index = 0; index < iSize; ++index) {
        v0  = textureLodOffset( verties, pos, 0.0, ivec2(1, 0) ).rgb;
        v01 = textureLodOffset( verties, pos, 0.0, ivec2(2, 0) ).rgb;
        v02 = textureLodOffset( verties, pos, 0.0, ivec2(3, 0) ).rgb;
        pos += vec2( 4.0 / size, 0.0);

        vec3 v2 = v01 - v0;
        vec3 v1 = v02 - v0;
        
        vec3 P = cross(dir, v2);
        float det = dot(v1, P);   //carmer rules devider
        if ( det > -EPSILON )
            continue;
        vec3 T = orig - v0;
        float invdet = 1.0 / det;

        float u = dot(T, P) * invdet;
        if (u < 0.0 || u > 1.0)
            continue;
        vec3 Q = cross(T, v1);
        float v = dot(dir, Q) * invdet;
        if (v < 0.0 || u + v > 1.0)
            continue;
        float t = dot(v2, Q) * invdet;
        if ( t > EPSILON && t < mint)
        {
            mint = t;
            minpos = pos - vec2(4.0 / size, 0.0);
            minuv = vec2(u, v);
        }
    }

    if (mint < 1e10) {
        orig += dir * mint;
        return vec4( vec3(textureLod( verties, minpos, 0.0).rgb), mint);
    }

    return vec4(0.0);
}

void main()
{
    iSize = int(size);
    i = uint(incount);
    vec2 fc = vec2(gl_FragCoord.xy);
    vec2 fcu = fc / resolution;
    seed = inseed + fcu.x + fcu.y;
    vec2 aa = fract( sin(vec2(seed, seed + 0.1)) * vec2(43758.5453123, 22578.1459123) );
    random_ofs = fract(gl_FragCoord.x * gl_FragCoord.y * inseed + aa.x) * 6.2831;
    vec4 view = proj * vec4( (fc + aa) / (resolution / 2.0) - 1.0, 0.0, 1.0);
    view = normalize( MVP * vec4(view.xyz / view.w, 0.0) );
    vec3 orig = origin;

    // check scene box intersect
    vec3 bmin = (BBmin - vec3(0.2) - orig) / view.xyz;
    vec3 bmax = (BBmax + vec3(0.2) - orig) / view.xyz;

    vec3 near = min(bmin, bmax);
    vec3 far = max(bmin, bmax);

    float ext_n = max(near.x, max(near.y, near.z));
    float ext_f = min(far.x, min(far.y, far.z));
    if(ext_f < 0.0 || ext_n > ext_f) {
        color.rgb = vec3(0.0);
        return;
    }
    // start tracing 
    orig += max(0.0, ext_n) * view.xyz;
    vec4 hit = trace(orig, view.xyz );
    if (hit.w <= 0.0) {
        color.rgb = vec3( 1.0 );
        return;
    }

    hit = trace(orig, -cosWeightedRandomHemisphereDirectionHammersley( -hit.xyz ));
    if (hit.w <= 0.0 ) {
        color.rgb = vec3( 0.8 );
        return;
    }
}