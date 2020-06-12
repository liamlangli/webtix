// output vec4 color;
void ray_missed(const ray i) {
  color = vec4(-i.direction * 0.5 + 0.5, 1.0);
}