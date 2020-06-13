/**
 * standard camera ray generate kernel
 **/
ray ray_generate() {
  vec3 origin = position.xyz;
  vec3 X = normalize(cross(forward.xyz, up.xyz));
  vec3 Y = normalize(cross(X, forward.xyz));
  vec2 offset = uv * 2.0 - 1.0;
  vec3 direction = normalize(forward.xyz * atan(fov) + X * offset.x + Y * offset.y);
  return ray(origin, direction);
}