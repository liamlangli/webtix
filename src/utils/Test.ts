import * as THREE from 'three';
(window as any).THREE = THREE;
import { Scene } from '../core/Scene';
import { dom } from '../lib/lan';

let scene: THREE.Scene;
let renderer: THREE.WebGLRenderer;
let camera: THREE.PerspectiveCamera;
let control: THREE.OrbitControls;

function init() {
    const testCanvas = dom('test') as HTMLCanvasElement;
    scene = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({canvas: testCanvas, antialias: true});
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(480, 320);
    renderer.setClearColor(0xf1f3f5);
    camera = new THREE.PerspectiveCamera(90, testCanvas.width / testCanvas.height, 0.1, 10000);
    camera.position.set(3, 3, 3);
    control = new THREE.OrbitControls(camera);
}

function render() {
    requestAnimationFrame(render);
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
}

export function sceneTest(archScene: Scene) {
    init();

    const accBuffer = archScene.accelerateBuffer.data;
    const offset = 0.05;
    for(let i = 0;i < accBuffer.length; i += 3 * 3) {
        const minX = accBuffer[i + 0] - offset;
        const minY = accBuffer[i + 1] - offset;
        const minZ = accBuffer[i + 2] - offset;
        const maxX = accBuffer[i + 3] + offset;
        const maxY = accBuffer[i + 4] + offset;
        const maxZ = accBuffer[i + 5] + offset;

        const color = (i + 10) / (accBuffer.length * 2 + 10);

        const geo = new THREE.Geometry();
        const mat = new THREE.LineBasicMaterial({color: new THREE.Color(color, color, color) });
        // bottom
        geo.vertices.push(new THREE.Vector3(minX, minY, minZ));
        geo.vertices.push(new THREE.Vector3(maxX, minY, minZ));

        geo.vertices.push(new THREE.Vector3(minX, minY, minZ));
        geo.vertices.push(new THREE.Vector3(minX, minY, maxZ));

        geo.vertices.push(new THREE.Vector3(minX, minY, maxZ));
        geo.vertices.push(new THREE.Vector3(maxX, minY, maxZ));

        geo.vertices.push(new THREE.Vector3(maxX, minY, minZ));
        geo.vertices.push(new THREE.Vector3(maxX, minY, maxZ));

        // pillar
        geo.vertices.push(new THREE.Vector3(minX, minY, minZ));
        geo.vertices.push(new THREE.Vector3(minX, maxY, minZ));

        geo.vertices.push(new THREE.Vector3(maxX, minY, minZ));
        geo.vertices.push(new THREE.Vector3(maxX, maxY, minZ));

        geo.vertices.push(new THREE.Vector3(minX, minY, maxZ));
        geo.vertices.push(new THREE.Vector3(minX, maxY, maxZ));

        geo.vertices.push(new THREE.Vector3(maxX, minY, maxZ));
        geo.vertices.push(new THREE.Vector3(maxX, maxY, maxZ));

        // ceiling
        geo.vertices.push(new THREE.Vector3(minX, maxY, minZ));
        geo.vertices.push(new THREE.Vector3(maxX, maxY, minZ));

        geo.vertices.push(new THREE.Vector3(minX, maxY, minZ));
        geo.vertices.push(new THREE.Vector3(minX, maxY, maxZ));

        geo.vertices.push(new THREE.Vector3(minX, maxY, maxZ));
        geo.vertices.push(new THREE.Vector3(maxX, maxY, maxZ));

        geo.vertices.push(new THREE.Vector3(maxX, maxY, minZ));
        geo.vertices.push(new THREE.Vector3(maxX, maxY, maxZ));

        scene.add(new THREE.LineSegments(geo, mat));
    }

    render();
}