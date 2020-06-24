#ifndef disney_kernel
#define disney_kernel

#define BSDF_REFLECTED 1
#define BSDF_TRANSMITTED 2
#define BSDF_SPECULAR 4

float ggx_smith(float n_dot_v, float roughness)
{
  float a = roughness * roughness;
  float b = n_dot_v * n_dot_v;
  return 1.0 / (n_dot_v + sqrt(a + b - a * b));
}

float fresnel_schlink(float u)
{
  float m = clamp(1 - u, 0., 1.);
  float m2 = m * m;
  return m2 * m2 * m; // pow(m,5)
}

// fresnel reflection probability
float fresnel(float v_dot_n, float eta_i, float eta_o) {
  float sin_theta_t2 = square(eta_i/eta_o) * (1.0 - v_dot_n * v_dot_n);

  // total internal reflection
  if (sin_theta_t2 > 1.0)
    return 1.0;

  float l_dot_n = sqrt(1.0 - sin_theta_t2);

  // todo: reformulate to remove this division
  float eta = eta_o / eta_i;

  float r1 = (v_dot_n - eta * l_dot_n)/(v_dot_n + eta * l_dot_n);
  float r2 = (l_dot_n - eta * v_dot_n)/(l_dot_n + eta * v_dot_n);

  return 0.5 * (square(r1) + square(r2));
}

float GTR1(float n_dot_h, float a) {
  if (a >= 1.0) return PI_INV;
  float a2 = a * a;
  float t = 1.0 + (a2 - 1.0) * n_dot_h * n_dot_h;
  return (a2 - 1.0) / (PI * log(a2) * t);
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

void disney_bsdf_sample(const material mat, float eta_i, float eta_o, const vec3 position, const vec3 u, const vec3 v, const vec3 normal, const vec3 view, inout vec3 light, inout float pdf, int type)
{
  float r = rand(v_uv);
  if (r < mat.transmission) {
    float F = fresnel(dot(normal, view), eta_i, eta_o);

    // sample reflectance or transmission based on Fresnel term
    if (rand_unstable(v_uv) < F)
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
        light = normalize(reflect(-view, half));

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
      if (rand_unstable(v_uv + 0.1) < 0.5) {
        // sample diffuse
        if (rand_unstable(v_uv + 0.2) < mat.subsurface)
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

vec3 disney_bsdf_eval(const material mat, const float eta_i, const float eta_o, const vec3 position, const vec3 normal, const vec3 view, const vec3 light) {
  float n_dot_l = dot(normal, light);
  float n_dot_v = dot(normal, view);

  vec3 half = normalize(light + view);

  float n_dot_h = Dot(normal, half);
  float l_dot_h = Dot(light, half);

  vec3 color_linear = vec3(mat.color);
  float color_luminance = luminance(color_linear);

  vec3 color_tint = color_luminance > 0. ? color_linear / color_luminance : vec3(1.0f); // normalize lum. to isolate hue + sat
  vec3 color_specular = lerp(mat.specular * .08 * lerp(vec3(1.0), color_tint, mat.specular_tint), color_linear, mat.metallic);

  vec3 bsdf = 0.0f;
  vec3 brdf = 0.0f;

  if (mat.transmission > 0.) {
    // evaluate BSDF
    if (n_dot_l <= 0.) {
      float F = fresnel(n_dot_v, eta_i, eta_o);
      bsdf = mat.transmission * (1.0 - F ) / abs(n_dot_l) * (1.0 - mat.metallic);
    } else {
      // specular lobe
      float a = max(0.001f, mat.roughness);
      float Ds = GTR2(n_dot_h, a);

      // fresnel term with the microfacet normal
      float F_h = fresnel(l_dot_h, eta_i, eta_o);

      vec3 Fs = lerp(color_specular, vec3(1.0f), F_h);
      float Gs = ggx_smith(n_dot_v, a) * ggx_smith(n_dot_l, a);

      bsdf = Gs * Fs * Ds;
    }
  }

  if (mat.transmission < 1.0) {
    // evaluate BRDF
    if (NDotL <= 0)
    {

      if (mat.subsurface > 0.0)
      {
        // take sqrt to account for entry/exit of the ray through the medium
        // this ensures transmitted light corresponds to the diffuse model
        vec3 s = sqrt(mat.color);
      
        float F_l = fresnel_schlink(abs(n_dot_l))
        float F_v = fresnel_schlink(n_dot_v);
        float F_d = (1.0 - 0.5 * F_l)*( 1.0 - 0.5 * F_v);

        brdf = PI_INV * s * mat.subsurface * F_d * (1.0 - mat.metallic);
      }

    } else {

      // specular
      float a = max(0.001, mat.roughness);
      float Ds = GTR2(n_dot_h, a);

      // Fresnel term with the microfacet normal
      float F_h = fresnel_schlink(l_dot_h);

      Vec3 Fs = lerp(color_specular, Vec3(1), F_h);
      float Gs = ggx_smith(n_dot_v, a) * ggx_smith(n_dot_l, a);

      // Diffuse fresnel - go from 1 at normal incidence to .5 at grazing
      // and mix in diffuse retro-reflection based on roughness
      float F_l = fresnel_schlink(n_dot_l);
      float F_v = fresnel_schlink(n_dot_v);
      float F0 = 0.5 + 2.0 * l_dot_h * l_dot_h * mat.roughness;
      float F_d = lerp(1.0, F0, F_l) * lerp(1.0f, F0, F_v);

      // Based on Hanrahan-Krueger BSDF approximation of isotrokPic bssrdf
      // 1.25 scale is used to (roughly) preserve albedo
      // Fss90 used to "flatten" retroreflection based on roughness
      //float Fss90 = LDotH*LDotH*mat.roughness;
      //float Fss = Lerp(1.0f, Fss90, FL) * Lerp(1.0f, Fss90, FV);
      //float ss = 1.25 * (Fss * (1.0f / (NDotL + NDotV) - .5) + .5);

      // clearcoat (ior = 1.5 -> F0 = 0.04)
      float Dr = GTR1(n_dot_h, lerp(.1,.001, mat.clearcoatGloss));
      float Fc = Lerp(.04f, 1.0f, F_h);
      float Gr = ggx_smith(n_dot_l, .25) * ggx_smith(n_dot_v, .25);

      brdf = PI_INV * F_d * color_linear * (1.0 - mat.metallic) * (1.0 - mat.subsurface) + Gs * Fs * Ds + mat.clearcoat * Gr * Fc * Dr;
    }

  }

  return lerp(brdf, bsdf, mat.transmission);
}

#endif