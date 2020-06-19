/**
 * global variable
 * bool terminated; // set true to terminate tracing procedure
 * output vec4 color; // output color
 **/
ray ray_closest_hit(const ray i, const trace_result result, const material mat) {
  vec3 reflect_direction = hammersley_sample_cos(result.normal, frame_index, sample_count);
  ray bounce_ray = ray(result.position + reflect_direction * EPSILON, reflect_direction);
  bool blocked = trace_shadow(bounce_ray);
  color += vec4(mix(sample_environment(bounce_ray.direction), vec3(0.0), float(blocked)), 1.0);

  terminated = true;
  return i;
}