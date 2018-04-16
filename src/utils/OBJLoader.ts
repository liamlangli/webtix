import { TextureBuffer } from "../core/TextureBuffer";

const re_vector  = /^v\s/;
const re_normal  = /^vn\s/;
const re_face = /^f\s/;
const re_space   = /\s+/;

export class OBJData {
    constructor(
        public size: number,
        public width: number,
        public height: number,
        public data: Float32Array
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
            vs.push([elements[0], elements[1], elements[2]]);
        } else if ( re_normal.test( line ) ) {
            vn.push([elements[0], elements[1], elements[2]]);
        } else if ( re_face.test(line) ) {
            
            let j  = -1
            let indices = [];
            let n;

            while (++j < elements.length) {
                var is = elements[j].split('/')
                indices.push(is[0])
                n = is[2];
            }

            indices.push(n);
            fs.push(indices);
        }
    }
    
    for( i = 0; i < fs.length; ++i ) {
        const v0 = vs[ fs[i][0] - 1 ];
        const v1 = vs[ fs[i][1] - 1 ];
        const v2 = vs[ fs[i][2] - 1 ];
        const n0 = vn[ fs[i][3] - 1 ];
        res.push(n0[0], n0[1], n0[2]);
        res.push(
            v0[0], v0[1], v0[2],
            v1[0], v1[1], v1[2],
            v2[0], v2[1], v2[2]
        );
    }
    return new TextureBuffer(res);
}

export async function OBJLoader( path ) {
    const data = await fetch(path);
    const obj = await data.text();
    return vertiesAbsorb(obj);
}