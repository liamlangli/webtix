import { GPUTexture } from "./texture";
import { GPUPipeline } from "./pipeline";
import { Matrix4 } from "../math/mat4";
import { Uniform } from "./uniform/uniform";
import { UniformVector4 } from "./uniform/uniform-vector4";
import { UniformTexture } from "./uniform/uniform-texture";
import { UniformMatrix4 } from "./uniform/uniform-mat4";
import { isUniformStruct, UniformStruct } from "./uniform/uniform-struct";
import { UniformFloat } from "./uniform/uniform-float";

export class UniformBlock {
    uniforms: Uniform[] = [];
    uniform_map: Map<string, Uniform> = new Map();

    private add_uniform(uniform: Uniform): void {
        this.uniforms.push(uniform);
        this.uniform_map.set(uniform.name, uniform);
    }

    create_uniform_float(name: string, value: number): UniformFloat {
        const uniform = new UniformFloat(name, value);
        this.add_uniform(uniform);
        return uniform;
    }

    create_uniform_vector4(
        name: string,
        x?: number,
        y?: number,
        z?: number,
        w?: number,
    ): UniformVector4 {
        const uniform = new UniformVector4(name, x, y, z, w);
        this.add_uniform(uniform);
        return uniform;
    }

    create_uniform_texture(name: string, texture: GPUTexture): UniformTexture {
        const uniform = new UniformTexture(name, texture);
        this.add_uniform(uniform);
        return uniform;
    }

    create_uniform_matrix4(name: string, matrix: Matrix4): UniformMatrix4 {
        const uniform = new UniformMatrix4(name, matrix);
        this.add_uniform(uniform);
        return uniform;
    }

    create_uniform_struct(
        name: string,
        buffer: Float32Array,
        slot: number,
    ): UniformStruct {
        const uniform = new UniformStruct(name, buffer, slot);
        this.add_uniform(uniform);
        return uniform;
    }

    get<T extends Uniform>(name: string): T | undefined {
        return this.uniform_map.get(name) as T;
    }

    locate(pipeline: GPUPipeline): void {
        const gl = pipeline.device.getContext<WebGL2RenderingContext>();
        for (let i = 0; i < this.uniforms.length; ++i) {
            const uniform = this.uniforms[i];
            if (isUniformStruct(uniform)) {
                uniform.location = gl.getUniformBlockIndex(
                    pipeline.program,
                    uniform.name,
                );
                gl.uniformBlockBinding(
                    pipeline.program,
                    uniform.location as any,
                    uniform.slot,
                );
            } else {
                uniform.location = gl.getUniformLocation(
                    pipeline.program,
                    uniform.name,
                )!;
            }
        }
    }

    upload(pipeline: GPUPipeline): void {
        for (let i = 0; i < this.uniforms.length; ++i) {
            const uniform = this.uniforms[i];
            uniform.upload(pipeline);
        }
    }
}
