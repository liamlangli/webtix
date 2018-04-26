#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;

#define EPSILON 0.000001

uniform mat4 MVP, proj;
uniform float inseed;
uniform int incount;
uniform vec2 resolution;

// [size, width, height];
uniform vec3 acceleratorInfo;  
uniform vec3 faceInfo;
uniform vec3 vertexInfo;
uniform vec3 normalInfo;
uniform vec3 materialInfo;

uniform sampler2D accelerator;
uniform sampler2D faces;
uniform sampler2D vertices;
uniform sampler2D normals;
uniform sampler2D materials;

in vec3 origin;
out vec4 color;

float seed;
uint N = 128u;

const float acceleratorGap = 3.0;
const float faceGap = 3.0;
const float materialGap = 4.0;

// global variable
const vec2 padding = vec2(0.0001);
const vec3 sky = vec3(0.318, 0.471, 0.624);
const vec3 ground = vec3(0.619, 0.607, 0.564);
const vec3 up = vec3(0.0, 1.0, 0.0);
const float nature_e = 2.718281828;

struct lightBlock {
    vec3 position, color;
    float power;
};

lightBlock sun = lightBlock(vec3(30.0, 30.0, -30.0), vec3(1.0), 100.0);
lightBlock moon = lightBlock(vec3(-30.0, 30.0, 30.0), vec3(1.0), 100.0);

const float ambientFactor = 0.02;

// global function
vec3 skyColor(vec3 dir) {
    return ground + (sky - ground) * exp(dot(normalize(dir), up));
}

vec3 requestVertex(float index) {
    float scalar = index / vertexInfo.y;
    float row = floor(scalar) / vertexInfo.z;
    float column = fract(scalar);
    vec2 pos = padding + vec2(column, row);
    return textureLod(vertices, pos, 0.0).rgb;
}

vec3 requestNormal(float index) {
    float scalar = index / normalInfo.y;
    float row = floor(scalar) / normalInfo.z;
    float column = fract(scalar);
    vec2 pos = padding + vec2(column, row);
    return textureLod(normals, pos, 0.0).rgb;
}

struct materialBlock {
    vec3 ambient, diffuse, specular;
    float roughness, opacity, refractFactor;
};

struct shadeBlock {
    vec3 origin, direction, N;
    materialBlock material;
};

materialBlock requestMaterialBlock(float index) {
    if (index < 0.0) {
        return materialBlock(vec3(0.0), vec3(0.0), vec3(0.0), 94.0, 1.0, 1.0); 
    }

    float scalar = index * materialGap / materialInfo.y;
    float row = floor(scalar) / materialInfo.z;
    float column = fract(scalar);
    vec2 pos = padding + vec2(column, row);
    vec3 ambient = textureLod(materials, pos, 0.0).rgb;
    vec3 diffuse = textureLodOffset(materials, pos, 0.0, ivec2(1, 0)).rgb;
    vec3 specular = textureLodOffset(materials, pos, 0.0, ivec2(2, 0)).rgb;
    vec3 rest = textureLodOffset(materials, pos, 0.0, ivec2(3, 0)).rgb;
    return materialBlock(ambient, diffuse, specular, rest.x, rest.y, rest.z);
}

struct primitiveBlock {
    vec3 n0, n1, n2, p0, p1, p2;
    float materialIndex;
};

primitiveBlock requestPrimitiveBlock(float faceIndex) {
    
    float faceScalar = faceIndex / faceInfo.y;
    float faceRow = floor(faceScalar) / faceInfo.z;
    float faceColumn = fract(faceScalar);
    vec2 facePos = padding + vec2(faceColumn, faceRow);
    vec3 faceInfo0 = textureLod(faces, facePos, 0.0).rgb;
    vec3 faceInfo1 = textureLodOffset(faces, facePos, 0.0, ivec2(1, 0)).rgb;
    vec3 faceInfo2 = textureLodOffset(faces, facePos, 0.0, ivec2(2, 0)).rgb;

    vec3 n0 = requestNormal(faceInfo0.y);
    vec3 n1 = requestNormal(faceInfo1.y);
    vec3 n2 = requestNormal(faceInfo2.y);
    vec3 p0 = requestVertex(faceInfo0.x);
    vec3 p1 = requestVertex(faceInfo1.x);
    vec3 p2 = requestVertex(faceInfo2.x);

    return primitiveBlock(n0, n1, n2, p0, p1, p2, faceInfo0.z);
}

struct accelerateBlock {
    vec3 minV, maxV, info;
};

accelerateBlock requestAccelerateBlock(float index) {
    float scalar = index / acceleratorInfo.y;
    float row = floor(scalar) / acceleratorInfo.z;
    float column = fract(scalar);
    vec2 pos = padding + vec2(column, row);
    vec3 minV = textureLod(accelerator, pos, 0.0).rgb;
    vec3 maxV = textureLodOffset(accelerator, pos, 0.0, ivec2(1, 0)).rgb;
    vec3 info = textureLodOffset(accelerator, pos, 0.0, ivec2(2, 0)).rgb;
    return accelerateBlock(minV, maxV, info);
}

vec3 centriodNormal(primitiveBlock p, float u, float v) {
    return p.n0 * (1.0 - u - v) + p.n1 * u + p.n2 * v;
}

bool contain(vec3 v, vec3 minV, vec3 maxV) {
    return v.x < maxV.x && v.y < maxV.y && v.z < maxV.z && v.x > minV.x && v.y > minV.y && v.z > minV.z;
}

float random_ofs = 0.0;
vec3 cosWeightedRandomHemisphereDirectionHammersley(const vec3 n)
{
    uint i = uint(incount);
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
    vec3 bmin = (minV - vec3(0.00001) - ori) / dir.xyz;
    vec3 bmax = (maxV + vec3(0.00001) - ori) / dir.xyz;

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

struct primitiveIntersection {
    vec3 normal;
    float mint, materialIndex;
};

primitiveIntersection primitivesIntersect(vec3 orig, vec3 dir, float start, float end, bool test) {

    float mint = 1e10;
    vec3 minNormal;
    float minMaterialIndex;
    vec3 v1, v2;
    float endIndex = end * faceGap;
    for (float index = start * faceGap; index <= endIndex; index += faceGap) {
        primitiveBlock block = requestPrimitiveBlock(index);

        v2 = block.p1 - block.p0;
        v1 = block.p2 - block.p0;
        
        vec3 P = cross(dir, v2);
        float det = dot(v1, P);   //carmer rules devider
        if ( det > -EPSILON)
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
            if(test) {
                return primitiveIntersection(vec3(0.0), 1.0, 0.0);
            } else {
                minNormal = centriodNormal(block, v, u);
                mint = t;
                minMaterialIndex = block.materialIndex;
            }
        }
    }

    if (mint < 1e10) {
        return primitiveIntersection(minNormal, mint, minMaterialIndex);
    }

    return primitiveIntersection(vec3(0.0), 0.0, 0.0);
}

bool test(vec3 orig, vec3 dir) {
    float ext;
    accelerateBlock block;
    primitiveBlock pBlock;
    for(float index = 0.0; index <= acceleratorInfo.x;) {
         block = requestAccelerateBlock(index);
         ext = boxIntersect(block.minV, block.maxV, orig, dir);
         if (ext >= 0.0) {
                if(block.info.z <= EPSILON) {
                    primitiveIntersection intersection = primitivesIntersect(orig, dir, block.info.x, block.info.y, true);
                    if (intersection.mint > 0.0) {
                        return true;
                    }
                }
        } else {
            if(block.info.z > 0.0) {
                index += block.info.z * acceleratorGap;
            }
        }
        index += acceleratorGap;
    }
    return false;
}

vec3 lightShade(materialBlock material, lightBlock light, vec3 orig, vec3 dir, vec3 normal) {
    vec3 lightShake = cosWeightedRandomHemisphereDirectionHammersley(vec3(1.0)) * 10.0;
    vec3 L = light.position + lightShake - orig;
    vec3 N = normal;
    vec3 V = - normalize(dir);

    if(test(orig - dir * EPSILON, normalize(L))) {
        return vec3(0.0);
    }

    float lambertFactor = 0.0;
    float specFactor = 0.0;
    float D = length(L);
    L = normalize(L);
    vec3 lightFactor = light.color * light.power / D;

    lambertFactor = max(dot(N, L), 0.0);
    if (lambertFactor > 0.0) {
        // Blinn-Phong
        vec3 H = normalize(L + V);
        float specAngle = max(dot(V, H), 0.0);
        float specFactor = pow(specAngle, material.roughness);
    }

    vec3 diffuseColor = material.diffuse * lambertFactor * lightFactor;
    vec3 specularColor = material.specular * specFactor * lightFactor;
    return material.ambient * ambientFactor + diffuseColor + specularColor;
}

shadeBlock bsBlock;
lightBlock reflectLight;

const float max_depth = 3.0;
vec4 trace(inout vec3 orig, vec3 dir) {

    vec3 outColor = vec3(0.0);
    float isIntersected = 0.0;
    for(float depth = 0.0; depth < max_depth; depth += 1.0) {

        float depthPower = pow(0.9, depth);

        accelerateBlock block;
        primitiveIntersection closestIntersection;
        closestIntersection.mint = 1e10;

        // traversal accelerator
        float ext;
        for(float index = 0.0; index <= acceleratorInfo.x;) {

            block = requestAccelerateBlock(index);
            ext = boxIntersect(block.minV, block.maxV, orig, dir);
            if (ext >= 0.0) {
                if(block.info.z <= EPSILON) {
                    primitiveIntersection intersection = primitivesIntersect(orig, dir, block.info.x, block.info.y, false);
                    if (intersection.mint > 0.0 && intersection.mint < closestIntersection.mint) {
                        closestIntersection = intersection;
                    }
                }
            } else {
                if(block.info.z > 0.0) {
                    index += block.info.z * acceleratorGap;
                }
            }
            index += acceleratorGap;
        }
        
        if (closestIntersection.mint < 1e10) {
            orig += dir * closestIntersection.mint;
            vec3 normal = closestIntersection.normal;
            materialBlock m = requestMaterialBlock(closestIntersection.materialIndex);
            vec3 shadeColor = depthPower * lightShade(m, sun, orig, dir, normal);

            // regrad reflect color as light
            vec3 reflectColor = vec3(0.0);
            if(depth > 0.0) {
                reflectLight = lightBlock(orig, shadeColor, 30.0);
                reflectColor = lightShade(bsBlock.material, reflectLight, bsBlock.origin, bsBlock.direction, bsBlock.N); 
            }
            outColor += shadeColor + reflectColor;
            bsBlock = shadeBlock(orig, dir, normal, m);

            dir = -cosWeightedRandomHemisphereDirectionHammersley(-normal);
            isIntersected = 1.0;
        } else {
            return vec4(outColor + skyColor(dir) * depthPower * 0.1, isIntersected);
        }
    }
    return vec4(outColor, isIntersected);
}

void main()
{
    vec2 fc = vec2(gl_FragCoord.xy);
    vec2 fcu = fc / resolution;
    seed = inseed + fcu.x + fcu.y;
    vec2 aa = fract(sin(vec2(seed, seed + 0.1)) * vec2(43758.5453123, 22578.1459123) );
    random_ofs = fract(gl_FragCoord.x * gl_FragCoord.y * inseed + aa.x) * 6.2831;
    vec4 view = proj * vec4((fc + aa) / (resolution / 2.0) - 1.0, 0.0, 1.0);
    view = normalize(MVP * vec4(view.xyz / view.w, 0.0));
    vec3 orig = origin;

    // global boundingbox intersect
    vec2 accPos = padding;
    vec3 BBmin = textureLod( accelerator, accPos, 0.0).rgb;
    accPos += vec2(1.0 / acceleratorInfo.y, 0.0);
    vec3 BBmax = textureLod( accelerator, accPos, 0.0).rgb;
    float ext = boxIntersect(BBmin, BBmax, orig, view.xyz);
    if( ext < 0.0 ) {
        color.a = 0.0;
        return;
    }

    // start tracing 
    vec4 hit = trace(orig, view.xyz);
    if (hit.w <= 0.0) {
        color.a = 0.0;
    } else {
        color = vec4( clamp(hit.rgb, 0.0, 1.0), 1.0);
    }
}