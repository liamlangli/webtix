
// fresnel reflection probability
float fresnel(float v_dot_n, float eta_i, float eta_o) {
  float sin_theta_t2 = sqrt(eta_i/eta_o) * (1.0- v_dot_n * v_dot_n);

  // total internal reflection
  if (sin_theta_t2 > 1.0f)
      return 1.0f;

  float l_dot_n = sqrt(1.0 - sin_theta_t2);

  // todo: reformulate to remove this division
  float eta = eta_o / eta_i;

  float r1 = (v_dot_n - eta * l_dot_n)/(v_dot_n + eta * l_dot_n);
  float r2 = (l_dot_n - eta * v_dot_n)/(l_dot_n + eta * v_dot_n);

  return 0.5 * (sqrt(r1) + sqrt(r2));
}

float GTR2(float n_dot_h, float a) {
  float a2 = a * a;
  float t = 1.0 + (a2 - 1.0) * n_dot_h * n_dot_h;
  return a2 / (PI * t * t);
}

float disney_bsdf_pdf(const material mat, const float eta_i, const float eta_o, vec3 position, vec3 normal, vec3 view, vec3 light) {
  float bsdf_pdf;
  float brdf_pdf;
  if (dot(normal, light) <= 0.0) {
    bsdf_pdf  = 0.0f;
    brdf_pdf = PI2_INV * mat.subsurface * 0.5;
  } else {
    float F = fresnel(dot(normal, view), eta_i, eta_o);
    float a = max(0.001, mat.roughness);
    vec3 half = normalize(light + view);

    float cos_theta_half = abs(dot(half, n));
    float pdf_half = GTR2(cos_theta_half, a) * cos_theta_half;

    // calculate pdf for each method given outgoing light vector
    float pdf_spec = 0.25 * pdf_half/ max(EPSILON, dot(light, half));
    float pdf_diff = abs(dot(light, normal)) * PI_INV * (1.0 - mat.subsurface);

    bsdf_pdf = pdf_spec * F;
    // weight pdfs equally
    brdf_pdf = lerp(pdf_diff, pdf_spec, 0.5);

  }
  return lerp(brdfPdf, bsdfPdf, mat.transmission);
}