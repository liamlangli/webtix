import { Arch } from "./core/Arch";
import { dom } from "./lib/lan";
import { OBJLoader } from "./loaders/OBJLoader";
import { Scene } from "./core/Scene";
import { BVH } from "./accelerator/BVH";
import { HDRLoad } from "./loaders/HDRLoader";

const arch = new Arch(dom('view') as HTMLCanvasElement);

OBJLoader('./obj', 'car').then((pack) => {
    console.log(pack);
    console.log(HDRLoad('./hdr/grass.hdr'));
    arch.bindScene(new Scene(pack, new BVH()));
    arch.render();
    // sceneTest(arch.scene);
});
