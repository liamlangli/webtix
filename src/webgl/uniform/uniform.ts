import { GPUDevice } from "../../device";
import { GPUPipeline } from "../pipeline";

export interface Uniform {
  name: string;
  location?: WebGLUniformLocation;
  upload(pipeline: GPUPipeline): void;
}