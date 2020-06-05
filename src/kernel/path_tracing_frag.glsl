#version 300 es

precision highp float;
precision highp int;
precision highp sampler2D;

// unifroms
uniform mat4 MVP, proj;
uniform float inseed;
uniform int incount;
uniform vec2 resolution;
uniform float useEnvmap;
uniform sampler2D envmap;

// input & output
in vec3 origin;
out vec4 color;

#include <stdlib>
#include <light>
#buffer <position>
#buffer <normal>
#include <material>
#include <accelerator>
#include <primitive>

// global variables
float seed;
uint N = 128u;
lightBlock sun = lightBlock(vec3(30.0, 30.0, -30.0), vec3(1.0), 80.0);
lightBlock moon = lightBlock(vec3(-30.0, 30.0, 30.0), vec3(1.0), 100.0);
vec3 sunShake;

vec3 centriodNormal(const primitiveBlock p, const float u, const float v) {
  return p.n0 * (1.0 - u - v) + p.n1 * u + p.n2 * v;
}

float random_ofs = 0.0;
vec3 rand_hammersley_cos(const vec3 n)
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

struct primitiveIntersection {
  vec3 normal;
  float mint, materialIndex;
};

primitiveIntersection primitivesIntersect(vec3 orig, vec3 dir, float start, float end, bool test) {
  
  float mint = 1e10;
  vec3 minNormal;
  float minMaterialIndex;
  vec3 v1, v2;
  float endIndex = end * primitiveGap;
  for (float index = start * primitiveGap; index <= endIndex; index += primitiveGap) {
    primitiveBlock block = requestPrimitiveBlock(index);

    v2 = block.p1 - block.p0;
    v1 = block.p2 - block.p0;
    
    vec3 P = cross(dir, v2);
    float det = dot(v1, P);   //carmer rules devider
    if ( det > -EPSILON && det < EPSILON)
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

#include <env_shade>

vec3 lightShade(materialBlock material, lightBlock light, vec3 orig, vec3 dir, vec3 normal) {
  vec3 L = light.position + sunShake - orig;
  vec3 N = normal;
  vec3 V = - normalize(dir);

  vec3 lightColor = envShade(reflect(dir, normal), orig);

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

  return material.ambient * ambientFactor + material.diffuse * lambertFactor * lightFactor +  material.specular * specFactor * lightFactor;
}

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
      if (ext >= 0.0 && ext < closestIntersection.mint) {
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
      outColor += depthPower * lightShade(m, sun, orig, dir, normal);
      dir = -rand_hammersley_cos(-normal);
      isIntersected = 1.0;
    } else {
      return vec4(outColor + envShade(dir, orig) * depthPower * 0.1, isIntersected);
    }
  }
  return vec4(outColor, isIntersected);
}

void main()
{
  sunShake = rand_hammersley_cos(vec3(1.0)) * 3.0;

  vec2 fc = vec2(gl_FragCoord.xy);
  vec2 fcu = fc / resolution;
  seed = inseed + fcu.x + fcu.y;
  vec2 aa = fract(sin(vec2(seed, seed + 0.1)) * vec2(43758.5453123, 22578.1459123) );
  random_ofs = fract(gl_FragCoord.x * gl_FragCoord.y * inseed + aa.x) * 6.2831;
  vec4 view = proj * vec4((fc + aa) / (resolution / 2.0) - 1.0, 0.0, 1.0);
  view = normalize(MVP * vec4(view.xyz / view.w, 0.0));
  vec3 orig = origin;

  // start tracing 
  vec4 hit = trace(orig, view.xyz);
  color = mix(vec4(envShade(view.xyz, orig), 1.0), vec4(clamp(hit.rgb, 0.0, 1.0), 1.0), hit.w);
}