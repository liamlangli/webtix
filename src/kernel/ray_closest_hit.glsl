/**
 * global variable
 * bool terminated; // set true to terminate tracing procedure
 * output vec4 color; // output color
 **/
ray ray_closest_hit(const ray i, const trace_result result) {
  vec3 reflect_direction = hammersley_sample_cos(result.normal, frame_index, sample_count);
  ray bounce_ray = ray(result.position + reflect_direction * EPSILON, reflect_direction);
  bool blocked = trace_shadow(bounce_ray);
  color.xyz += mix(vec3(1.0), vec3(0.3), float(blocked));

  terminated = true;

  return ray(i.origin, i.direction);
}