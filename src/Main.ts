import { Arch } from "./core/Arch";
import { dom } from "./lib/lan";
import { OBJLoader } from "./loaders/OBJLoader";
import { Scene } from "./core/Scene";
import { BVH } from "./accelerator/BVH";
import { HDRLoad } from "./loaders/HDRLoader";

const canvas = dom('view') as HTMLCanvasElement
const arch = new Arch(canvas);
const status = dom('status') as HTMLElement;

async function Main(): Promise<Scene> {
    const scene = new Scene(new BVH());
    const hdr = await HDRLoad('./hdr/grass.hdr');
    scene.bindEnvironmentMap(hdr);
    const pack = await OBJLoader('./obj', 'home');
    scene.bindOBJPackage(pack);
    return scene;
}

Main().then((scene) => {
    arch.bindScene(scene);
    arch.render();
})

status.onclick = function() {
    
    setTimeout( function() {
        const link = document.createElement('a');
        link.download = 'sample.png';
        link.href = canvas.toDataURL();
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }, 0);

}
