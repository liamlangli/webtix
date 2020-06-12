Webtix
-----
> Path-tracing render engine base on WebGL2.

This project was created to saving your life while you were suffered from wrote ray tracing applications on other RayTracing frameworks, such as Optix Metal-MPS or Mitsuba, Which might cost amount of your time to set up a project, configuration compile tool chains and so on.

We want that you could implement your customized ray-tracing algorithm by just write several lines of glsl shader code.

Assume that ray-tracing developers would like to share their render result with others mostly. So we implement project with webgl & typescript. which was easy to share and present.

## Core Component
- [x] BVH builder
- [ ] Builtin memory allocator
- [x] Buffer texture sampler
- [ ] BSDF solver kernel
- [ ] Free camera control