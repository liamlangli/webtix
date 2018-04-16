export class TextureBuffer {

    size: number;
    width: number;
    height: number;
    data: Float32Array;

    constructor(inputData: number[]) {
    // align data
        const len = inputData.length / 3;
        this.size = len;
        if(len < 4096) {
            this.width = len
            this.height = 1; 
            this.data = new Float32Array(inputData);
        } else {
            const lines = Math.ceil(len / 4096);
            const output = new Float32Array(lines * 4096 * 3);
            output.set(inputData);
            this.width = 4096;
            this.height = lines;
            this.data = new Float32Array(output);
        }
    }

    genInfoBuffer():Float32Array {
        return new Float32Array([this.size, this.width, this.height]);
    }
}