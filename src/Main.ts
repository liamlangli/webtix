import { Arch } from "./core/Arch";
import { dom } from "./lib/lan";
import { OBJLoader, OBJPackage } from "./loaders/OBJLoader";
import { Scene } from "./core/Scene";
import { BVH } from "./accelerator/BVH";
import { HDRLoad } from "./loaders/HDRLoader";

const canvas = dom('view') as HTMLCanvasElement
const arch = new Arch(canvas);
const status = dom('status') as HTMLElement;

function Main() {
    const scene = new Scene(new BVH());
    scene.loadScenePackage('scene/house.scene').then(function() {
        HDRLoad('./hdr/grass.hdr').then(function(hdr) {
            scene.bindEnvironmentMap(hdr);
            arch.bindScene(scene);
            arch.render();
        });
    });

    // OBJLoader('obj', 'house').then(function(pack:OBJPackage) {
    //     scene.bindOBJPackage(pack);
    //     HDRLoad('./hdr/grass.hdr').then(function(hdr) {
    //         scene.bindEnvironmentMap(hdr);
    //         arch.bindScene(scene);
    //         arch.render();
    //         // scene.exportScenePackage('house');
    //     });
    // });
}

Main();

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
