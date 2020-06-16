Buffer Texture
==============
> WebGL2 Fallback

### indexed geometry
for indexed geometry, we have attribute `position` `normal`
- memory layout
```typescript
// position texture buffer, for each pixel save the Point3
[pointX, pointY, pointZ] // RGBFormat

// normal texture buffer
[normalX, normalY, normalZ] // RGBFormat

// vertex texture buffer
[vertexIndex0, vertexIndex1, vertexIndex2, materialIndex]

// bvh buffer, use three pixels per node
[boxMinX, boxMinY, boxMinZ]
[boxMaxX, boxMaxY, boxMaxZ]
[childrenCount, vertexIndex, longestAxis]

// material buffer, seven pixel per node
[albedoR, albedoG, albedoB]
[emissionR, emissionG, emissionB]
[absorptionR, absorptionG, absorptionB]
[eta, metallic, subsurface]
[specular, roughness, specular_tint]
[anisotropic, sheen, sheenTint]
[clearcoat, clearcoat_glossiness, transmission];
```

