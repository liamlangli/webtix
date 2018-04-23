Shade
=====

### BRDF (Bidirectional Reflectance Distribution Function)
todo in the feture( maybe not -.- )

### Blinn_Phong
current illumination model   
```

global:
    ambientFactor: number

struct Light
    position: vec3
    color: rgb
    power: number

struct Material
    ambient: rgb
    diffuse: rgb
    specular: rgb
    roughness: number
    opacity: number
    refract: number

input:
    orig: vec3      // hit position
    view: vec3      // view direction
    normal: vec3    // normal
    light: Light
    material        
output:
    color: rgb

pseudocode:
    vec3 V = - dir
    vec3 L = light.postion - orig
    vec3 N = normal
    number D = length(L)

    float lamberFactor = max(0.0, dot(N, L));
    if lamberFactor < 0:
        return black
    else:
        vec3 H = normalize(L, N)
        float specularAngle = max(0.0, dot(N, H))
        float specularFactor = pow(specularAngle, material.roughness)

        rgb lightColorScalar = light.color * light.power / D

        rgb ambientColor = ambientFactor * material.ambient
        rgb diffuseColor = lambertFactor * material.diffuse * lightColorScalar
        rgb specularColor = specularFactor * material.spcular * lightColorScalar
        return ambientColor + diffuseColor + specularColor
```
