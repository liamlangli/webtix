import { Renderer } from "./core/renderer";
import { snapshot_save_canvas } from "./utils/snapshot";

const canvas = document.getElementById('view') as HTMLCanvasElement
const renderer = new Renderer(canvas);
(window as any).renderer = renderer;

function main() {
  renderer.start();
}

main();

(window as any).save = function() {
  snapshot_save_canvas(canvas);
}