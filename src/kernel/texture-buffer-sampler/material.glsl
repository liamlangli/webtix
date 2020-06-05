#ifndef material_request
#define material_request

uniform sampler2D materialTexture;
uniform vec4 material_size;

struct materialBlock {
  vec3 ambient, diffuse, specular;
  float roughness, opacity, refractFactor;
};

materialBlock requestMaterialBlock(const float index) {
  if (index < 0.0) {
    return materialBlock(vec3(0.0), vec3(0.0), vec3(0.0), 94.0, 1.0, 1.0); 
  }
  float scalar = index * material_size.z / material_size.y;
  float row = floor(scalar) / material_size.z;
  float column = fract(scalar);
  vec2 pos = vec2(0.0001) + vec2(column, row);
  vec3 ambient = textureLod(materialTexture, pos, 0.0).rgb;
  vec3 diffuse = textureLodOffset(materialTexture, pos, 0.0, ivec2(1, 0)).rgb;
  vec3 specular = textureLodOffset(materialTexture, pos, 0.0, ivec2(2, 0)).rgb;
  vec3 rest = textureLodOffset(materialTexture, pos, 0.0, ivec2(3, 0)).rgb;
  return materialBlock(ambient, diffuse, specular, rest.x, rest.y, rest.z);
}

#endif