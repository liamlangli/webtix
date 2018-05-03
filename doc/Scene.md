Scene
=====

#### Scene file load & produce
- load scene file   
```
const scene = new Scene(new BVH());
scene.loadScenePackage('scene/home.scene').then(function() {
    const hdr = HDRLoad('./hdr/grass.hdr').then(function(hdr) {
        scene.bindEnvironmentMap(hdr);
        arch.bindScene(scene);
        arch.render();
    });
});
```

- export `.scene` from `.obj`   
```
const scene = new Scene(new BVH());
OBJLoader('obj', 'car').then(function(pack) {
    scene.bindOBJPackage(pack);
    scene.exportScenePackage('car');
});
```