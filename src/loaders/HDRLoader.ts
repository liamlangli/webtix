/**
 * origin source
 * https://github.com/enkimute/hdrpng.js/blob/master/hdrpng.js
 */

const HDR_Exposure = 1.0;
const HDR_Gamma = 2.2;


/** Convert an RGBE buffer to a Float buffer.
 * @param {Uint8Array} buffer The input buffer in RGBE format. (as returned from loadHDR)
 * @param {Float32Array} [res] Optional result buffer containing 3 floats per pixel.
 * @returns {Float32Array} A floating point buffer with 96 bits per pixel (32 per channel, 3 channels).
 */
function rgbeToFloat(buffer: Uint8Array, res: Float32Array): Float32Array {
    let s: number;
    const l = buffer.byteLength >> 2;
    res = res || new Float32Array(l * 3);
    for (let i = 0; i < l; i++) {
        s = Math.pow(2, buffer[i * 4 + 3] - (128 + 8));
        res[i * 3] = buffer[i * 4] * s;
        res[i * 3 + 1] = buffer[i * 4 + 1] * s;
        res[i * 3 + 2] = buffer[i * 4 + 2] * s;
    }
    return res;
}

/** Convert an RGBE buffer to LDR with given exposure and display gamma.
 * @param {Uint8Array} buffer The input buffer in RGBE format. (as returned from loadHDR)
 * @param {float} [exposure=1] Optional exposure value. (1=default, 2=1 step up, 3=2 steps up, -2 = 3 steps down)
 * @param {float} [gamma=2.2]  Optional display gamma to respect. (1.0 = linear, 2.2 = default monitor)
 * @param {Array} [res] res Optional result buffer.
 */
function rgbeToLDR(buffer: Uint8Array, exposure: number, gamma: number, res) {
    exposure = Math.pow(2, exposure === undefined ? 1 : exposure) / 2;
    if (gamma === undefined)
        gamma = 2.2;
    const one_over_gamma = 1 / gamma;
    let s;
    const l = buffer.byteLength >> 2;
    res = res || new Uint8ClampedArray(l * 4);
    for (let i = 0; i < l; i++) {
        s = exposure * Math.pow(2, buffer[i * 4 + 3] - (128 + 8));
        res[i * 4] = 255 * Math.pow(buffer[i * 4] * s, one_over_gamma);
        res[i * 4 + 1] = 255 * Math.pow(buffer[i * 4 + 1] * s, one_over_gamma);
        res[i * 4 + 2] = 255 * Math.pow(buffer[i * 4 + 2] * s, one_over_gamma);
        res[i * 4 + 3] = 255;
    }
    return res;
}

function process(buffer: ArrayBuffer): HTMLCanvasElement {
    let header = '';
    let pos = 0;
    const d8 = new Uint8Array(buffer);
    let format;

    // read header.  
    while (!header.match(/\n\n[^\n]+\n/g))
        header += String.fromCharCode(d8[pos++]);
    // check format. 
    format = header.match(/FORMAT=(.*)$/m)[1];
    if (format != '32-bit_rle_rgbe') return console.warn('unknown format : ' + format), this.onerror();
    // parse resolution
    const rez = header.split(/\n/).reverse()[1].split(' ');
    const width = rez[3] as any * 1
    const height = rez[1] as any * 1;
    // Create image.
    const img = new Uint8Array(width * height * 4)
    let ipos = 0;
    // Read all scanlines
    for (let j = 0; j < height; j++) {
        const rgbe = d8.slice(pos, pos += 4)
        const scanline = [];
        if ((rgbe[0] != 2) || (rgbe[1] != 2) || (rgbe[2] & 0x80)) {
            console.warn('HDR parse error ..');
            return;
        }
        if ((rgbe[2] << 8) + rgbe[3] != width) {
            console.warn('HDR line mismatch ..');
            return;
        }
        for (let i = 0; i < 4; i++) {
            let ptr = i * width;
            const ptr_end = (i + 1) * width;
            let buf;
            let count;
            while (ptr < ptr_end) {
                buf = d8.slice(pos, pos += 2);
                if (buf[0] > 128) {
                    count = buf[0] - 128;
                    while (count-- > 0)
                        scanline[ptr++] = buf[1];
                } else {
                    count = buf[0] - 1;
                    scanline[ptr++] = buf[1];
                    while (count-- > 0)
                        scanline[ptr++] = d8[pos++];
                }
            }
        }
        for (let i = 0; i < width; i++) {
            img[ipos++] = scanline[i];
            img[ipos++] = scanline[i + width];
            img[ipos++] = scanline[i + 2 * width];
            img[ipos++] = scanline[i + 3 * width];
        }
    }

    const HDRData = img;
    const canvas = document.createElement('canvas');
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext('2d');
    const HDRD = context.getImageData(0, 0, width, height);
    rgbeToLDR(img, HDR_Exposure, HDR_Gamma, HDRD.data);
    context.putImageData(HDRD, 0, 0);
    return canvas;
}

export async function HDRLoad(path) {
    const response = await fetch(path);
    const buffer = await response.arrayBuffer();
    return await process(buffer);
}
