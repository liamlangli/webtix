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

// global variable
const vec2 padding = vec2(0.0001);
const vec3 sky = vec3(0.318, 0.471, 0.624);
const vec3 ground = vec3(0.619, 0.607, 0.564);
const vec3 up = vec3(0.0, 1.0, 0.0);
const float nature_e = 2.718281828;

const vec3 sun = vec3(30.0, 30.0, 30.0);

// global function
vec3 skyColor(vec3 dir) {
    // return ground + (sky - ground) * pow( 5.0, dot(normalize(dir), up));
    return ground + (sky - ground) * exp(dot(normalize(dir), up));
}

struct primitiveBlock {
    vec3 n0, p0, p1, p2;
};

primitiveBlock requestPrimitiveBlock(float index) {
    float scalar = index / primitiveWidth;
    float row = floor(scalar) / primitiveHeight;
    float column = fract(scalar);
    vec2 pos = padding + vec2(column, row);
    vec3 n0 = textureLod(primitives, pos, 0.0).rgb;
    vec3 p0 = textureLodOffset(primitives, pos, 0.0, ivec2(1, 0)).rgb;
    vec3 p1 = textureLodOffset(primitives, pos, 0.0, ivec2(2, 0)).rgb;
    vec3 p2 = textureLodOffset(primitives, pos, 0.0, ivec2(3, 0)).rgb;
    return primitiveBlock(n0, p0, p1, p2);
}

struct accelerateBlock {
    vec3 minV, maxV, info;
};

accelerateBlock requestAccelerateBlock(float index) {
    float scalar = index / acceleratorWidth;
    float row = floor(scalar) / acceleratorHeight;
    float column = fract(scalar);
    vec2 pos = padding + vec2(column, row);
    vec3 minV = textureLod(accelerator, pos, 0.0).rgb;
    vec3 maxV = textureLodOffset(accelerator, pos, 0.0, ivec2(1, 0)).rgb;
    vec3 info = textureLodOffset(accelerator, pos, 0.0, ivec2(2, 0)).rgb;
    return accelerateBlock(minV, maxV, info);
}

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
    vec3 bmin = (minV - vec3(0.001) - ori) / dir.xyz;
    vec3 bmax = (maxV + vec3(0.001) - ori) / dir.xyz;

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

    float mint = 1e10;
    vec3 minNormal;
    vec2 minuv;
    primitiveBlock block;
    vec3 v1, v2;
    float endIndex = end * 4.0;
    for (float index = start * 4.0; index <= endIndex; index += 4.0) {
        block = requestPrimitiveBlock(index);

        v2 = block.p1 - block.p0;
        v1 = block.p2 - block.p0;
        
        vec3 P = cross(dir, v2);
        float det = dot(v1, P);   //carmer rules devider
        if ( det > -EPSILON )
            continue;
        vec3 T = orig - block.p0;
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
            minNormal = block.n0;
        }
    }

    if (mint < 1e10) {
        return vec4(minNormal, mint);
    }

    return vec4(0.0);
}

vec4 trace(inout vec3 orig, vec3 dir) {

    vec4 result = vec4(1.0, 1.0, 1.0, 1e10);
    accelerateBlock block;
    // traversal accelerator
    float ext;
    for(float index = 0.0; index <= acceleratorSize;) {

        block = requestAccelerateBlock(index);
        ext = boxIntersect(block.minV, block.maxV, orig, dir);
        if (ext >= 0.0) {
            if(block.info.z <= EPSILON) {
                vec4 tmpResult = primitivesIntersect(orig, dir, block.info.x, block.info.y);
                if (tmpResult.w > 0.0 && tmpResult.w < result.w) {
                    result = tmpResult;
                }
            }
        } else {
            if(block.info.z > 0.0) {
                index += block.info.z * 3.0;
            }
        }
        index += 3.0;
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
    vec2 accPos = padding;
    vec3 BBmin = textureLod( accelerator, accPos, 0.0).rgb;
    accPos += vec2(1.0 / acceleratorWidth, 0.0);
    vec3 BBmax = textureLod( accelerator, accPos, 0.0).rgb;
    float ext = boxIntersect(BBmin, BBmax, orig, view.xyz);
    if( ext < 0.0 ) {
        color.rgb = skyColor(view.xyz);
        return;
    }

    // start tracing 
    vec4 hit = trace(orig, view.xyz);
    if (hit.w <= 0.0) {
        color.rgb = skyColor(view.xyz);
        return;
    }

    vec3 reflect_dir = -cosWeightedRandomHemisphereDirectionHammersley( -hit.xyz );
    hit = trace(orig, reflect_dir);
    if (hit.w <= 0.0 ) {
        color.rgb = vec3( 0.8 );
        return;
    }

    color.rgb = skyColor(view.xyz) * 0.5;
}