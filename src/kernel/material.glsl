#ifndef material
#define material

struct material {
  vec3 emission;
  vec3 color;
  vec3 absorption;

  float eta;
  float metallic;
  float subsurface;

  float specular;
  float roughness;
  float specularTint;

  float anisotropic;
  float sheen;
  float sheenTint;

  float clearcoat;
  float clearcoatGloss;
  float transmission;
};


#endif