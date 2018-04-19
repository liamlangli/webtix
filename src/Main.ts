import { Arch } from "./core/Arch";
import { dom } from "./lib/lan";
import { OBJLoader } from "./utils/OBJLoader";
import { Scene } from "./core/Scene";
import { BVH } from "./accelerator/BVH";

const arch = new Arch(dom('view') as HTMLCanvasElement);

OBJLoader('../obj/colonial.obj').then((data) => {
    console.log(data);
    arch.bindScene(new Scene(data, new BVH()));
    arch.render();
    // sceneTest(arch.scene);
});


