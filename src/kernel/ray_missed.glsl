// output vec4 color;

// hit nothing, sample environment and return
void ray_missed(ray r) {
#ifdef SAMPLE_AO
  color = vec4(1.0);
#else
  color.xyz += vec3(sample_environment(r.direction) * throughput);
#endif
}