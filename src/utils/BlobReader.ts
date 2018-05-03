export function BlobReader(blob: Blob): Promise<Float32Array> {
   
    return new Promise<Float32Array>(function(resolve, reject) {
        const reader = new FileReader(); 

        reader.addEventListener('loadend', function(event) {
            resolve(new Float32Array(reader.result));
        }, false);

        reader.readAsArrayBuffer(blob);
    });
}