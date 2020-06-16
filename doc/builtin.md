builtin function & variable
===========================

## variables
|name|scope|type|mode|description|
|----|-----|-----|-----|---------|
|frame_index|global|float|readonly| frame index|
|sample_count|global|float|readonly| max sample count|
|screen_width|global|float|readonly| screen width|
|random_seed|global|float|seed| random number range [0, 1]|
|position|global|vec4|readonly| camera position, only xyz valid|
|forward|global|vec4|readonly| camera forward direction, only xyz valid|
|up|global|vec4|readonly| camera up direction, only xyz valid|
|fov|global|float|readonly| camera vertical field of view|

## functions
|name| definition | description|
|----| ---------- | -----------|
|rand| float rand(vec2 uv)| stable random function range [0, 1]|
|rand_unstable|float rand_unstable(const vec2 i)|unstable random function range [0, 1]|
|linear_to_srgb| vec3 linear_to_srgb(vec3 i) | linear rgb to display srgb|
|luminance| float luminance(vec3 c)| color luminance|
|radical_inverse|float radical_inverse(uint i)| radical inverse sequence|
|hemisphere_sample_cos| vec3 hemisphere_sample_cos(const vec3 n, vec2 coord)| sample points on unit hemisphere with cos weight align normal vector |
| hemisphere_sample_uniform| vec3 hemisphere_sample_uniform(const vec3 n, vec2 coord) | sample points on unit hemisphere with average weight aligh normal vector|
|hammersley_sample_2d| 
vec2 hammersley_sample_2d(float i, float count)| hammersley low discrepancy sequence|
| hammersley_sample_cos | vec3 hammersley_sample_cos(const vec3 n, const float i, const float count)| hammersley low discrepancy sequence sample points on unit hemisphere with cos weight align normal vector|
|hammersley_sample_uniform|vec3 hammersley_sample_uniform(const vec3 n, const float i, const float count)|hammersley low discrepancy sequence sample points on unit hemisphere with average weight aligh normal vector|