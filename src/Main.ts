import { Renderer } from "./core/renderer";

const canvas = document.getElementById('view') as HTMLCanvasElement
const renderer = new Renderer(canvas);

function main() {
  renderer.start();
}

main();