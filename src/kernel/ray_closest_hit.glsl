/**
 * global variable
 * bool terminated; // set true to terminate tracing procedure
 * output vec4 color; // output color
 **/
ray ray_closest_hit(const ray i, const trace_result result) {

  float seed = random_seed + uv.x + uv.y;
  vec2 aa = fract(sin(vec2(seed, seed + 0.1)) * vec2(43758.5453123, 22578.1459123) );
  float offset = fract(gl_FragCoord.x * gl_FragCoord.y * seed + aa.x) * 6.2831;

  vec3 reflect_direction = rand_hammersley_cos(result.normal, frame_index, sample_count, offset);
  ray bounce_ray = ray(reflect_direction, result.position + reflect_direction * 0.0001);
  bool blocked = trace_shadow(bounce_ray);
  color.xyz += mix(vec3(1.0), vec3(0.3), float(blocked));

  terminated = true;

  return ray(i.origin, i.direction);
}