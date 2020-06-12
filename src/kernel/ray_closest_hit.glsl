/**
 * global variable
 * bool terminated; // set true to terminate tracing procedure
 * output vec4 color; // output color
 **/
ray ray_closest_hit(const ray i, const trace_result result) {
  color += vec4(reflect(result.normal, i.direction) * 0.5 + 0.5, 1.0);

  terminated = true;

  return ray(i.origin, i.direction);
}