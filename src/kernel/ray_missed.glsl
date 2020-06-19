// output vec4 color;
void ray_missed(ray r) {
  color = vec4(sample_environment(r.direction), 1.0);
}