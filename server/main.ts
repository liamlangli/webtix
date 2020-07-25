import { Renderer } from '../src/core/renderer';
import { snapshot_save_canvas } from '../src/utils/snapshot';
import { PathTraceEngine } from '../src/core/path-trace-engine';
import { draco_decode, draco_to_geometry } from '../src/loaders/draco-loader';

const canvas = document.getElementById('view') as HTMLCanvasElement
const renderer = new Renderer(canvas);
const engine = new PathTraceEngine(renderer);

const global = (window as any);
global.engine = engine;

async function main() {
  const geometry = await draco_decode('draco/lucy.drc');
  engine.set_geometry(draco_to_geometry(geometry));
  engine.set_environment('forest.hdr');
  engine.run();
}

main();

(window as any).save = function() {
  snapshot_save_canvas(canvas);
}