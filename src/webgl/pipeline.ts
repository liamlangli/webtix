import { ShaderLib } from "./shader-lib";
import { GPUDevice } from "../device";
import { TextureBuffer } from "../core/texture-buffer";
import { UniformBlock } from "./uniform-block";

const include_pattern = /#include <(.+)>/g;
const buffer_pattern = /#buffer <(.+)>/g;

export class GPUPipelineDescriptor {
  vertexShader: string = '';
  fragmentShader: string = '';
  buffers?: Map<string, TextureBuffer>;
  block?: UniformBlock;
}

export class GPUPipeline {

  program: WebGLProgram;
  private vertexShader: string;
  private fragmentShader: string;

  private buffers?: Map<string, TextureBuffer>;
  private block?: UniformBlock;

  constructor(public device: GPUDevice, descriptor: GPUPipelineDescriptor) {
    const gl = this.device.getContext<WebGL2RenderingContext>();

    this.vertexShader = descriptor.vertexShader;
    this.fragmentShader = descriptor.fragmentShader;
    this.buffers = descriptor.buffers || new Map();
    this.block = descriptor.block;

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, this.compile(this.vertexShader, gl.VERTEX_SHADER));
    gl.attachShader(this.program, this.compile(this.fragmentShader, gl.FRAGMENT_SHADER));
    gl.linkProgram(this.program);

    if (this.block) {
      this.block.locate(this);
    }
  }

  private flatten(source: string): string {
    // shader clip fetch
    let match;

    while (match = include_pattern.exec(source)) {
      const match_pattern = match[0];
      const kernel_name = match[1];
      const kernel_clip = ShaderLib.request(kernel_name);
      source = source.replace(match_pattern, kernel_clip);
    }

    while (match = buffer_pattern.exec(source)) {
      const match_pattern = match[0];
      const buffer_name = match[1];
      const buffer = this.buffers!.get(buffer_name);
      if (!buffer) {
        throw `buffer ${buffer_name} not found.`;
      }
      const buffer_node = buffer.toString();
      source = source.replace(match_pattern, buffer_node);
    }

    return source;
  }

  private compile(source: string, type: any): WebGLShader {
    const gl = this.device.getContext<WebGL2RenderingContext>();

    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, this.flatten(source));
    gl.compileShader(shader);
    const shaderInfo = gl.getShaderInfoLog(shader);

    if (shaderInfo != '') {
      const optimized_source = this.flatten(source).split(/\n/g).map(function (line, n) { return `${n}:${line}`;}).join('\n');
      console.log(`error in shader:\n${shaderInfo}\nsource_code:\n' ${optimized_source}`);
    }

    return shader;
  }

  activate() {
    const gl = this.device.getContext<WebGL2RenderingContext>();
    gl.useProgram(this.program);
    if (this.block) {
      this.block.upload(this.device);
    }
  }

}