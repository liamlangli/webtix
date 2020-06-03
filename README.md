PathTracer
-----
> PathTracing Renderer base on WebGL2.

The project aim for saving your life while you ware suffer from other RayTracing framework, such as Optix Metal-MPS or Mitsuba, Which might cost amount of your time to set up a project, configuration compile tool chains.

We want that you could implement your customized ray-tracing algorithm by just write several lines of glsl shader code.

Assume that you ray-tracing guys would like to share your render result with others mostly. So we implement project with webgl & typescript. which was easy to share and present.

## Core Component
- [ ] BVH builder
- [ ] Builtin memory allocator
- [ ] Buffer texture sampler
- [ ] BSDF solver
- [ ] Free camera control