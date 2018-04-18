export const PrimitiveBufferWidth = 1024 * 4;
export const AcceleratorBufferWidth = 1024 * 3;

export class TextureBuffer {

    size: number;
    width: number;
    height: number;
    data: Float32Array;

    constructor(inputData: number[], bufferWidth: number) {
        // align data
        const len = inputData.length / 3;
        this.size = len;
        if(len < bufferWidth) {
            this.width = len
            this.height = 1; 
            this.data = new Float32Array(inputData);
        } else {
            const lines = Math.ceil(len / bufferWidth);
            const output = new Float32Array(lines * bufferWidth * 3);
            output.set(inputData);
            this.width = bufferWidth;
            this.height = lines;
            this.data = new Float32Array(output);
        }
    }

    genInfoBuffer():Float32Array {
        return new Float32Array([this.size, this.width, this.height]);
    }
}