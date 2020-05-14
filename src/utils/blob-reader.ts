export function BlobReader(blob: Blob): Promise<Float32Array> {
    const reader = new FileReader(); 
    return new Promise<Float32Array>(function(resolve, reject) {
        reader.addEventListener('loadend', function(event) {
            resolve(new Float32Array(reader.result as ArrayBuffer));
        }, false);
        reader.readAsArrayBuffer(blob);
    });
}