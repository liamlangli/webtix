import { BufferArray } from "../types";

export interface Image<T extends BufferArray = Float32Array> {
  width: number;
  height: number;
  data: T;
}