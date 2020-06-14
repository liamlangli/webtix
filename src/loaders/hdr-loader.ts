
function rgbe_to_float(src: Uint8Array, src_offset: number, dst: Float32Array, dst_offset: number): void {
  const e = src[src_offset + 3];
  const scale = Math.pow(2.0, e - 128.0) / 255.0;
  dst[dst_offset + 0] = src[src_offset + 0] * scale;
  dst[dst_offset + 1] = src[src_offset + 1] * scale;
  dst[dst_offset + 2] = src[src_offset + 2] * scale;
}

export function hdr_load(uri: string): Float32Array {
  return new Float32Array();
}