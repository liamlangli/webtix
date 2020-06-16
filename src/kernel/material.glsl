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
  float specular_tint;

  float anisotropic;
  float sheen;
  float sheenTint;

  float clearcoat;
  float clearcoat_glossiness;
  float transmission;
};


#endif