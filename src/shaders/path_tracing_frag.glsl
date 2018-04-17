#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;

#define EPSILON 0.000001

uniform mat4 MVP, proj;
uniform float inseed;
uniform int incount;
uniform vec2 resolution;

uniform vec3 primitiveInfo;     // [size, width, height];
uniform vec3 acceleratorInfo;  // [size, width, height];

uniform sampler2D primitives;
uniform sampler2D accelerator;

in vec3 origin;
out vec4 color;

float primitiveSize, primitiveWidth, primitiveHeight;
int pSize;
float acceleratorSize, acceleratorWidth, acceleratorHeight;
int aSize;

float seed;
uint N = 128u;
uint i;

bool contain(vec3 v, vec3 minV, vec3 maxV) {
    return v.x < maxV.x && v.y < maxV.y && v.z < maxV.z && v.x > minV.x && v.y > minV.y && v.z > minV.z;
}

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

float boxIntersect(vec3 minV, vec3 maxV, vec3 ori, vec3 dir) {
    vec3 bmin = (minV - ori) / dir.xyz;
    vec3 bmax = (maxV - ori) / dir.xyz;

    vec3 near = min(bmin, bmax);
    vec3 far = max(bmin, bmax);

    if (contain(ori, minV, maxV) ) {
        return 0.0;
    }

    float ext_n = max(near.x, max(near.y, near.z));
    float ext_f = min(far.x, min(far.y, far.z));
    if(ext_f < 0.0 || ext_n > ext_f) {
        return -1.0;
    }
    return ext_n;
}

vec4 primitivesIntersect(vec3 orig, vec3 dir, float start, float end) {

    int startIndex = int(start);
    int endIndex = int(end);
    float mint = 1e10;
    vec2 minpos, minuv;
    vec2 pos = vec2(0.0001) + vec2(4.0 / primitiveSize * start, 0.0);
    vec3 v0, v01, v02;
    vec3 v1, v2;

    for(int index = startIndex; index < endIndex; ++index) {
        v0  = textureLodOffset(primitives, pos, 0.0, ivec2(1, 0)).rgb;
        v01 = textureLodOffset(primitives, pos, 0.0, ivec2(2, 0)).rgb;
        v02 = textureLodOffset(primitives, pos, 0.0, ivec2(3, 0)).rgb;
        pos += vec2(4.0 / primitiveSize, 0.0);

        v2 = v01 - v0;
        v1 = v02 - v0;
        
        vec3 P = cross(dir, v2);
        float det = dot(v1, P);   //carmer rules devider
        if ( det > -EPSILON && det < EPSILON )
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
        if (t > EPSILON && t < mint) {
            mint = t;
            minpos = pos - vec2(4.0 / primitiveSize);
            // minuv = vec2(u, v);
        }
    }

    if (mint < 1e10) {
        return vec4(textureLod(primitives, minpos, 0.0).rgb, mint);
    }

    return vec4(0.0);
}

vec4 trace(inout vec3 orig, vec3 dir) {

    vec4 result = vec4(1.0, 1.0, 1.0, 1e10);

    // traversal accelerator
    vec3 vMin, vMax;
    vec3 info; // info => left, right, childCount; 
    vec2 aPos = vec2(0.0);
    float ext;
    for(int i = 0; i < aSize;) {
        float stepSize = 3.0;
        vMin = textureLod(accelerator, aPos, 0.0).rgb;
        vMax = textureLodOffset(accelerator, aPos, 0.0, ivec2(1, 0)).rgb;
        info = textureLodOffset(accelerator, aPos, 0.0, ivec2(2, 0)).rgb;

        ext = boxIntersect(vMin, vMax, orig, dir);

        if (ext >= 0.0) {
            if(info.z <= EPSILON) {
                vec4 tmpResult = primitivesIntersect(orig, dir, info.x, info.y);
                if (tmpResult.w > 0.0 && tmpResult.w < result.w) {
                    result = tmpResult;
                }
            }
        } else {
            if(info.z > 0.0) {
                float childSize = info.z * 3.0;
                i += int(childSize);
                stepSize += childSize;
            }
        }
        i += 3;
        aPos += vec2(stepSize / acceleratorSize, 0.0);
    }
    
    if (result.w < 1e10) {
        orig += dir * result.w;
        return result;
    }

    return vec4(0.0);
}

void main()
{
    primitiveSize = primitiveInfo.x;
    primitiveWidth = primitiveInfo.y;
    primitiveHeight = primitiveInfo.z;
    acceleratorSize = acceleratorInfo.x;
    acceleratorWidth = acceleratorInfo.y;
    acceleratorHeight = acceleratorInfo.z;

    pSize = int(primitiveSize);
    aSize = int(acceleratorSize);
    i = uint(incount);
    vec2 fc = vec2(gl_FragCoord.xy);
    vec2 fcu = fc / resolution;
    seed = inseed + fcu.x + fcu.y;
    vec2 aa = fract( sin(vec2(seed, seed + 0.1)) * vec2(43758.5453123, 22578.1459123) );
    random_ofs = fract(gl_FragCoord.x * gl_FragCoord.y * inseed + aa.x) * 6.2831;
    vec4 view = proj * vec4( (fc + aa) / (resolution / 2.0) - 1.0, 0.0, 1.0);
    view = normalize( MVP * vec4(view.xyz / view.w, 0.0) );
    vec3 orig = origin;

    // global boundingbox intersect
    vec2 accPos = vec2(0.00001);
    vec3 BBmin = textureLod( accelerator, accPos, 0.0).rgb;
    accPos += vec2(1.0 / acceleratorSize, 0.0);
    vec3 BBmax = textureLod( accelerator, accPos, 0.0).rgb;
    float ext = boxIntersect(BBmin, BBmax, orig, view.xyz);
    if( ext < 0.0 ) {
        color.rgb = vec3(1.0);
        return;
    }

    // start tracing 
    vec4 hit = trace(orig, view.xyz);
    if (hit.w <= 0.0) {
        color.rgb = vec3(1.0);
        return;
    }

    hit = trace(orig, -cosWeightedRandomHemisphereDirectionHammersley( -hit.xyz ));
    if (hit.w <= 0.0 ) {
        color.rgb = vec3( 0.8 );
        return;
    }
}