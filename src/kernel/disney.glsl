#define BSDF_REFLECTED 1
#define BSDF_TRANSMITTED 2
#define BSDF_SPECULAR 4

// fresnel reflection probability
float fresnel(float v_dot_n, float eta_i, float eta_o) {
  float sin_theta_t2 = square(eta_i/eta_o) * (1.0- v_dot_n * v_dot_n);

  // total internal reflection
  if (sin_theta_t2 > 1.0f)
      return 1.0f;

  float l_dot_n = sqrt(1.0 - sin_theta_t2);

  // todo: reformulate to remove this division
  float eta = eta_o / eta_i;

  float r1 = (v_dot_n - eta * l_dot_n)/(v_dot_n + eta * l_dot_n);
  float r2 = (l_dot_n - eta * v_dot_n)/(l_dot_n + eta * v_dot_n);

  return 0.5 * (square(r1) + square(r2));
}

float GTR2(float n_dot_h, float a) {
  float a2 = a * a;
  float t = 1.0 + (a2 - 1.0) * n_dot_h * n_dot_h;
  return a2 / (PI * t * t);
}

float disney_bsdf_pdf(const material mat, const float eta_i, const float eta_o, vec3 position, vec3 normal, vec3 view, vec3 light) {
  float bsdf_pdf = 0.0;
  float brdf_pdf = 0.0;
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

void disney_brdf_sample(const material mat, float eta_i, float eta_o, const vec3 position, const vec3 u, const vec3 v, const vec3 normal, const vec3 view, inout vec3 light, inout float pdf, int type)
{
  float r = rand(uv);
  if (r < mat.transmission) {
    float F = fresnel(dot(normal, view), eta_i, eta_o);

    // sample reflectance or transmission based on Fresnel term
    if (rand_unstable(uv) < F)
    {
     // sample specular
      vec2 rr = hammersley_sample_2d(frame_index, sample_count);

      float a = max(0.001f, mat.roughness);
      float half_phi = rr.x * PI2;

      float half_theta_cos = sqrt((1. - rr.y) / (1. + (square(a) - 1.) * rr.y));
      float half_theta_sin = sqrt(max(0., 1. - square(half_theta_cos)));
      float half_phi_sin = sin(half_phi);
      float half_phi_cos = cos(half_phi);

      vec3 half = u * (half_theta_sin * half_phi_cos) + v * (half_theta_sin * half_phi_sin) + normal * half_theta_cos;

      if (dot(half, view) <= 0.0) {

        half *= -1.0;
        type = BSDF_REFLECTED;
        light = 2.0 * dot(view, half) * half - view;

      } else {
        float eta = eta_i / eta_o;
        vec3 refract_light = refract(view, normal, eta);

        if (refract_light !== vec3(0.0)) {
          type = BSDF_SPECULAR;
          pdf = (1.0 - F) * mat.transmission;
          return;
        } else {
          pdf = 0.0;
          return;
        }
      }
    } else {
      // sample brdf
      if (rand_unstable(uv + 0.1) < 0.5) {
        // sample diffuse
        if (rand_unstable(uv + 0.2) < mat.subsurface)
        {
          light = hammersley_sample_uniform(-normal, frame_index, sample_count);
          // negate z coordinate to sample inside the surface
          type = BSDF_TRANSMITTED;
        }
        else
        {
          light = hammersley_sample_cos(normal, frame_index, sample_count);
          type = BSDF_REFLECTED;
        }
      } else {
        vec2 rr = hammersley_sample_2d(frame_index, sample_count);
        // sample specular
        float a = max(0.001f, mat.roughness);
        float half_phi = rr.x * PI2;
        float half_theta_cos = sqrt((1. - rr.y) / (1. + (square(a) - 1.) * rr.y));
        float half_theta_sin = sqrt(max(0., 1. - square(half_theta_cos)));
        float half_phi_sin = sin(half_phi);
        float half_phi_cos = cos(half_phi);

        vec3 half = u * (half_theta_sin * half_phi_cos) + v * (half_theta_sin * half_phi_sin) + normal * half_theta_cos;
        // ensure half angle in same hemisphere as incoming light vector
        if (dot(half, view) <= 0.0f)
            half *= -1.0f;
        light = reflect(view, half);
        type = BSDF_REFLECTED;
      }
    }
  }
  pdf = disney_bsdf_pdf(mat, eta_i, eta_o, position, normal, view, light);
}