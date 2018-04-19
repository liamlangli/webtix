/**
 * more into see doc/OBJLoader.md
 */


import { TextureBuffer } from "../core/TextureBuffer";

const re_vector  = /^v\s/;
const re_normal  = /^vn\s/;
const re_face = /^f\s/;
const re_space   = /\s+/;


const ground = [
    0, 1, 0, 100, 0, 100, 100, 0, -100, -100, 0, -100,
    0, 1, 0, 100, 0 ,100, -100, 0, -100, -100, 0, 100
];

export class OBJData {
    constructor(
        public vertices: Array<Array<number>>,
        public normals: Array<Array<number>>,
        public faces: Array<Array<number>>,
    ) {}
}

function vertiesAbsorb(data: string) {
    const res = [];
    const vs = [];
    const vn = [];
    const fs = [];

    const lines = data.split('\n');
    var i = -1
    while ( ++i < lines.length) {
        const line = lines[i].trim()
        const elements = line.split(re_space)
        elements.shift();

        if ( re_vector.test( line ) ) {
            vs.push([parseFloat(elements[0]), parseFloat(elements[1]), parseFloat(elements[2])]);
        } else if ( re_normal.test( line ) ) {
            vn.push([parseFloat(elements[0]), parseFloat(elements[1]), parseFloat(elements[2])]);
        } else if ( re_face.test(line) ) {
            
            let j  = -1
            let indices = [];

            while (++j < elements.length) {
                var is = elements[j].split('/')
                indices.push(parseFloat(is[0]) - 1, parseFloat(is[2]) - 1, 0);
            }
            fs.push(indices);
        }
    }
    
    // for( i = 0; i < fs.length; ++i ) {
    //     const v0 = vs[ fs[i][0] - 1 ];
    //     const n0 = vn[ fs[i][1] - 1 ];
    //     const v1 = vs[ fs[i][2] - 1 ];
    //     const n1 = vn[ fs[i][3] - 1 ];
    //     const v2 = vs[ fs[i][4] - 1 ];
    //     const n2 = vn[ fs[i][5] - 1 ];
    //     res.push(
    //         n0[0], n0[1], n0[2],
    //         n1[0], n1[1], n1[2],
    //         n2[0], n2[1], n2[2],
    //         v0[0], v0[1], v0[2],
    //         v1[0], v1[1], v1[2],
    //         v2[0], v2[1], v2[2]
    //     );
    // }
    // return new Float32Array(res);
    return new OBJData(vs, vn, fs);
}

export async function OBJLoader( path ) {
    const data = await fetch(path);
    const obj = await data.text();
    return vertiesAbsorb(obj);
}