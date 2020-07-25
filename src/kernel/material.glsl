#ifndef material_kernel
#define material_kernel

struct material
{
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

#ifdef material_fetch
material material_from_block(material_block block)
{
  return material(block.a, block.b, block.c,
    block.d.x, block.d.y, block.d.z,
    block.e.x, block.e.y, block.e.z,
    block.f.x, block.f.y, block.f.z,
    block.g.x, block.g.y, block.g.z
  );
}
#endif

#endif