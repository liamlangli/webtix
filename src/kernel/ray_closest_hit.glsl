/**
 * global variable
 * bool terminated; // set true to terminate tracing procedure
 * output vec4 color; // output color
 **/
ray ray_closest_hit(const ray i, const trace_result result) {

  vec3 reflect_direction = rand_hammersley_cos(result.normal, frame_index, sample_count, rand(uv));
  ray bounce_ray = ray(reflect_direction, result.position + reflect_direction * EPSILON);
  bool blocked = trace_shadow(bounce_ray);

  if (!blocked)
    color += vec4(1.0);

  terminated = true;

  return ray(i.origin, i.direction);
}