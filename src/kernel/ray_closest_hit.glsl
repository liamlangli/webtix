#define ENV_SAMPLE

/**
 * global variable
 * bool terminated; // set true to terminate tracing procedure
 * output vec4 color; // output color
 **/
ray ray_closest_hit(const ray ray_input, const trace_result result, const material mat) {

#ifdef ENV_SAMPLE
  // Simple Env Sampling
  vec3 reflect_direction = hammersley_sample_cos(result.normal, frame_index, sample_count);
  ray bounce_ray = ray(result.position + reflect_direction * EPSILON, reflect_direction);
  bool blocked = trace_shadow(bounce_ray);
  color += vec4(mix(sample_environment(bounce_ray.direction), vec3(0.0), float(blocked)), 1.0);

  terminated = true;
  return ray_input;

#else
  // BSDF Sampling
  float bsdf_pdf = 0.0;
  int bsdf_type;
  vec3 bsdf_direction;
  vec3 hit_position = result.position;
  vec3 hit_normal = result.normal;
  vec3 view = -ray_input.direction;
  vec3 surface_eta = mat.eta;
  ray ray_output;

  // index of refraction for transmission, 1.0 corresponds to air
  if (ray_eta == 1.0) {
    ray_absorption = mat.absorption;
  } else {
    // returning to free space
    surface_eta = 1.0;
    ray_absorption = vec3(0.0);
  }

  // update throughput based on absorption through the medium
  pathThroughput *= exp( -ray_absorption * result.t);

  // TODO Light Sampling

  disney_bsdf_sample(mat, ray_eta, surface_eta, hit_position, hit_normal, view, bsdf_direction, bsdf_type);

  if (bsdf_pdf <= 0.0)
    break;

  vec3 f = disney_bsdf_eval(mat, ray_eta, surface_eta, hit_position, hit_normal, view, bsdf_direction);

  if (dot(hit_normal, bsdf_direction) <= 0.0) {
    ray_eta = surface_eta;
  }

  // update throughput with primitive reflectance
  throughput *= f * abs(dot(n, bsdfDir)) / bsdfPdf;
  ray_type = bsdf_type;
  ray_output.direction = bsdf_direction;
  ray_output.origin = hit_position + face_normal(hit_normal, bsdf_direction) * EPSILON;

  return ray_output;
#endif
}