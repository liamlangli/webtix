#ifndef material_kernel
#define material_kernel

struct material {
  vec3 emission;
  vec3 color;
  vec3 absorption;

  float eta; // index of refraction
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

material default_material = material(
  vec3(0.0), vec3(1.0, 215.0 / 255.0, 0.0), vec3(0.0),
  1.6, 1.0, 0.0,
  1.0, 0.2, 0.0,
  0.0, 0.0, 0.0,
  0.0, 0.0, 0.0
);

#endif