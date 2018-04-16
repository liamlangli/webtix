Shader Traversal
================

#### BVH Accelerator Traversal
from start
1. check box intersect
    - intersect
        1. check if end node
            - child count != 1
                1. jump step gap
            - child count = 1
                1. traversal primitives
                2. jump step gap
            

    - no intersect
        1. check if end node
            - child end node != 1
                1. jump step gap * childCount
