import { Renderer } from "./core/renderer";
import draco_decode, { draco_get_attribute, draco_set_attribute } from "./loaders/draco-loader";
import { bvh_build_geometry_indexed } from "./core/mesh-bvh";
import { compute_normal_indexed } from "./utils/compute-normal";

const canvas = document.getElementById('view') as HTMLCanvasElement
const renderer = new Renderer(canvas);

async function main() {
  const geometry = await draco_decode('draco/bunny.drc');
  console.log(geometry);

  const position = draco_get_attribute(geometry, 'position');
  if (position === undefined) {
    throw `invalid geometry because of position attribute wasn\'t exists`;
  }

  const indexBuffer = geometry.index.array as Uint32Array;
  const positionBuffer = position.array as Float32Array;

  let normal = draco_get_attribute(geometry, 'normal');
  if (normal === undefined) {
    console.warn('recompute normal attribute');
    const normalBuffer = compute_normal_indexed(indexBuffer, positionBuffer);
    draco_set_attribute(geometry, 'normal', normalBuffer, 3);
    normal = draco_get_attribute(geometry, 'normal');
  }

  const normalBuffer = normal!.array;

  const bvh = bvh_build_geometry_indexed(indexBuffer, positionBuffer);
  console.log(bvh);
}

main();