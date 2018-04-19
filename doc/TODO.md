Arch WebGL RayTracing Render Engine
===================================

# TODO list

- buffer data to texture
```
贴图的最大宽度为4096个浮点数值，也就是4096 * 4 = 16384位，贴图的长度与宽度必须刚好填充满整个贴图空间，因此，当数据不满足相应行数的时候，应该使用0补齐。
当vertices数据输入到Arch中时，判断每个节点所包含的数据尺寸，目前的数据尺寸为三个顶点坐标，一个片面法向量，总共4个浮点数值。
当vertices.length < 4096 * 3 时 width 为 len / 3, height 为 1,
当vertices.length > 4096 * 3 时 width 为 4096， height 为 floor(len / 4096),
size始终为vertices.length / 3;
```

- bvh & grid accelerator   
    [done] see [BVH.md](./BVH.md)

- pbr shading model ( align data to texture )
    nope