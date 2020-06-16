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
