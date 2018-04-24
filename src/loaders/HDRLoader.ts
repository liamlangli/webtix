
export class HDRData {
    constructor(
        public data: Uint8Array,
        public width: number,
        public height: number
    ) {};
}

function process(buffer: ArrayBuffer): HDRData {
    let header = '';
    let pos = 0;
    const d8 = new Uint8Array(this.response);
    let format;

    // read header.  
    while (!header.match(/\n\n[^\n]+\n/g))
        header += String.fromCharCode(d8[pos++]);
        // check format. 
    format = header.match(/FORMAT=(.*)$/m)[1];
    if (format!='32-bit_rle_rgbe') return console.warn('unknown format : '+format),this.onerror();
    // parse resolution
    const rez = header.split(/\n/).reverse()[1].split(' ');
    const width = rez[3] as any * 1
    const height = rez[1] as any * 1;
    // Create image.
    const img =new Uint8Array(width * height * 4)
    let ipos=0;
    // Read all scanlines
    for (let j=0; j < height; j++) {
        const rgbe = d8.slice(pos, pos += 4)
        const scanline = [];
        if ((rgbe[0] != 2)||(rgbe[1] != 2)||(rgbe[2] & 0x80)) {
            console.warn('HDR parse error ..');
            return;
        } 
        if ((rgbe[2] << 8) + rgbe[3] != width) {
            console.warn('HDR line mismatch ..');
            return;
        }
        for (let i = 0;i < 4; i++) {
            let ptr = i * width;
            const ptr_end= (i + 1) * width;
            let buf;
            let count;
            while (ptr<ptr_end){
                buf = d8.slice(pos,pos+=2);
                if (buf[0] > 128) { 
                    count = buf[0]-128; 
                    while(count-- > 0)
                        scanline[ptr++] = buf[1];
                } else {
                    count = buf[0]-1;
                    scanline[ptr++]=buf[1];
                    while( count -- > 0) 
                        scanline[ptr++] = d8[pos++];
                }
            }
        }
        for (let i = 0; i < width; i++) {
            img[ipos++] = scanline[i];
            img[ipos++] = scanline[i+width];
            img[ipos++] = scanline[i+2*width];
            img[ipos++] = scanline[i+3*width];
        }
    }
    return new HDRData(img, width, height);
}

export async function HDRLoad(path) {
    const response = await fetch(path);
    const buffer = await response.arrayBuffer();
    return await process(buffer);
}
