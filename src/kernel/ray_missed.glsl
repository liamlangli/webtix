// output vec4 color;

// hit nothing, sample environment and return
void ray_missed(ray r) {
  color.xyz += vec3(sample_environment(r.direction) * throughput);
}