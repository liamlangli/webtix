import { Renderer } from "./core/renderer";
import { BVH } from "./accelerator/geometry-bvh";

const canvas = document.getElementById('view') as HTMLCanvasElement
const renderer = new Renderer(canvas);

function main() {
  renderer.start();
}

main();