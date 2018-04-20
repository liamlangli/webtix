import { Arch } from "./core/Arch";
import { dom } from "./lib/lan";
import { OBJLoader } from "./utils/OBJLoader";
import { Scene } from "./core/Scene";
import { BVH } from "./accelerator/BVH";

const arch = new Arch(dom('view') as HTMLCanvasElement);

OBJLoader('./obj', 'house').then((pack) => {
    console.log(pack);
    arch.bindScene(new Scene(pack.objData, new BVH()));
    arch.render();
    // sceneTest(arch.scene);
});
