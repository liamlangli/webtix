BVH Contructor
==============

#### node structure
```
class BVHNode {
    box: Box3;
    left: BVHNode;
    right: BVHNode;
    axis: number;
}
```

#### build task for each node 

给定Primitive数组中的某一段数据，首先.
1. 计算BoundingBox,计算BoundingBox.Center.
2. 计算最长的数轴, LongestAxis.
3. 根据最长轴,对场景进行空间划分,按最长轴方向将Primitive排序。最后取中间点为划分点.
4. 根据划分点将源数据划分为两段,然后继续构建。

#### traverse task for each node
根据构建好的BVH树生产加速结构ArrayBuffer
ArrayBuffer中存储着BVH节点中所有的数据,每个节点的数据大致为:
[bMinx, bMiny, bMinz, bMaxx, bMaxy, bMaxz, leftIndex, rightIndex, childCount];


#### shader traverse for bvh accelerator

