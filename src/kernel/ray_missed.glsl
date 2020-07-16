// output vec4 color;

// hit nothing, sample environment and return
void ray_missed(ray r) {
  color += vec4(sample_environment(r.direction) * throughput, 1.0);
}