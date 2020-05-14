import { ShaderLib } from "./shader-lib";
import { GPUDevice } from "../device";

const include_pattern = /#include <.+?>/g;
const shader_name_pattern = /<(.+?)>/g;

export class GPUPipeline {

  program: WebGLProgram;

  constructor(public device: GPUDevice, vs: string, fs: string) {
    const gl = device.getContext<WebGL2RenderingContext>();
    this.program = gl.createProgram()!;
    gl.attachShader(this.program, this.compile(vs, gl.VERTEX_SHADER));
    gl.attachShader(this.program, this.compile(fs, gl.FRAGMENT_SHADER));
    gl.linkProgram(this.program);
  }

  flatten(source: string): string {
    const matches = source.match(include_pattern);
    if (matches) {
      for (let i = 0, il = matches.length; i < il; ++i) {
        const match_include = matches[i]
        const shader_name_match = match_include.match(shader_name_pattern)![0];
        const origin_source = ShaderLib.request(shader_name_match.replace(/(<|>)/g, ''));
        source = source.replace(match_include, origin_source);
      }
    }
    return source;
  }

  compile(source: string, type: any): WebGLShader {
    const gl = this.device.getContext<WebGL2RenderingContext>();
    const shader = gl.createShader(type)!;
    gl.shaderSource(shader, this.flatten(source));
    gl.compileShader(shader);
    const shaderInfo = gl.getShaderInfoLog(shader);

    if (shaderInfo != '') {
      console.log('shader log info: ' + shaderInfo, this.flatten(source));
    }

    return shader;
  }

  activate() {
    const gl = this.device.getContext<WebGL2RenderingContext>();
    gl.useProgram(this.program);
  }

}