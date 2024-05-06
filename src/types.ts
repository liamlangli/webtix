export type BufferArray =
    | Float32Array
    | Float64Array
    | Int8Array
    | Int16Array
    | Int32Array
    | Uint8Array
    | Uint16Array
    | Uint32Array;

export interface ObjectMap<T> {
    [key: string]: T;
}
