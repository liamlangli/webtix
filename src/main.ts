import { PathTraceEngine } from "./core/path-trace-engine";
import { Renderer } from "./core/renderer";
import { draco_decode, draco_to_geometry } from "./loaders/draco-loader";
import { MaterialControl } from "./ui/dom/material-control";
import { snapshot_save_canvas } from "./utils/snapshot";
import { ShaderLib } from "./webgl";


async function main() {
    await ShaderLib.init();
    const canvas = document.getElementById("view") as HTMLCanvasElement;
    const renderer = new Renderer(canvas);
    const engine = new PathTraceEngine(renderer);
    await engine.init();

    const global = window as any;
    global.engine = engine;

    const geometry = await draco_decode("draco/lucy.drc");
    engine.set_geometry(draco_to_geometry(geometry));
    engine.set_environment("forest.hdr");
    engine.run();
    const control = new MaterialControl(
        document.getElementById("material-control") as HTMLDivElement,
    );
    control.control(engine.default_material);
    (window as any).save = function () {
        snapshot_save_canvas(canvas);
    };
}

main();
