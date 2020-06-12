import { GPUDevice } from "../../device";

export interface Uniform {
  name: string;
  location?: WebGLUniformLocation;
  upload(device: GPUDevice): void;
}