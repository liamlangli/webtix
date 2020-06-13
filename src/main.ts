import { Renderer } from "./core/renderer";
import { snapshot_save_canvas } from "./utils/snapshot";
import { PathTraceEngine } from "./core/path-trace-engine";
import draco_decode from "./loaders/draco-loader";

const canvas = document.getElementById('view') as HTMLCanvasElement
const renderer = new Renderer(canvas);
const engine = new PathTraceEngine(renderer);

const global = (window as any);
global.engine = engine;

async function main() {
  const geometry = await draco_decode('draco/helmet.drc');
  engine.set_geometry(geometry);
  engine.run();
}

main();

(window as any).save = function() {
  snapshot_save_canvas(canvas);
}