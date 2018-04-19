OBJLoader
=========


### v1.0
目前第一阶段，我们只考虑加载OBJ模型中的顶点以及法线信息。


### origin data group
将.obj文件菜如解析器，生成三种数组：
- vertices => [[x, y, z], ... ]
- normals => [[x, y, z], ... ]
- faces (目前只考虑三角面片)
    - [
        [
            p0_v_index, p0_n_index, placeholder,
            p1_v_index, p1_n_index, placeholder,
            p2_v_index, p2_n_index, placeholder
        ]
            
    ]