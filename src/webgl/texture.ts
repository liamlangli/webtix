import { GPUDevice } from "../device";
import {
    TextureFilter,
    PixelFormat,
    LinearFilter,
    RGBFormat,
    TextureType,
    TextureDataType,
    TEXTURE_2D,
    FloatType,
} from "./webgl2-constant";
import { BufferArray } from "../types";
import { Image } from "../core/image";

export interface GPUTexture {
    activate(slot: number): void;
    bufferData(data: BufferArray, width: number, height: number): void;
    raw<T>(): T;
    delete(): void;
}

export class GPUTextureDescriptor {
    minFilter: TextureFilter = LinearFilter;
    magFilter: TextureFilter = LinearFilter;

    type: TextureType = TEXTURE_2D;
    dataType: TextureDataType = FloatType;

    format: PixelFormat = RGBFormat;
    internalFormat: GLenum = WebGL2RenderingContext.RGB32F;

    flipY: boolean = true;
    premultiplyAlpha: boolean = false;

    image?: Image;
}

export class GPUTextureInternal implements GPUTexture {
    public format: PixelFormat;
    public dataType: TextureDataType;
    public type: TextureType;
    public internalFormat: any;

    public texture: WebGLTexture;
    public image?: Image;

    constructor(
        public device: GPUDevice,
        descriptor: GPUTextureDescriptor,
    ) {
        const gl = device.getContext<WebGL2RenderingContext>();
        this.texture = gl.createTexture()!;

        this.type = descriptor.type;
        this.internalFormat = descriptor.internalFormat;
        this.format = descriptor.format;
        this.dataType = descriptor.dataType;
        this.image = descriptor.image;

        gl.bindTexture(descriptor.type, this.texture);

        gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
        gl.pixelStorei(
            gl.UNPACK_FLIP_Y_WEBGL,
            descriptor.flipY === true ? 1 : 0,
        );
        gl.pixelStorei(
            gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,
            descriptor.premultiplyAlpha === true ? 1 : 0,
        );

        gl.texParameteri(descriptor.type, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(descriptor.type, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

        gl.texParameteri(
            descriptor.type,
            gl.TEXTURE_MIN_FILTER,
            descriptor.minFilter,
        );
        gl.texParameteri(
            descriptor.type,
            gl.TEXTURE_MAG_FILTER,
            descriptor.magFilter,
        );

        if (this.image) {
            gl.texImage2D(
                this.type,
                0,
                this.internalFormat,
                this.image.width!,
                this.image.height!,
                0,
                this.format,
                this.dataType,
                this.image.data,
            );
        }

        gl.bindTexture(this.type, null);
    }

    bufferData(
        data: BufferArray,
        width: number,
        height: number,
        level: number = 0,
    ): void {
        const gl = this.device.getContext<WebGL2RenderingContext>();
        gl.bindTexture(this.type, this.texture);
        gl.texImage2D(
            this.type,
            0,
            this.internalFormat,
            width,
            height,
            0,
            this.format,
            this.dataType,
            data,
        );
        // gl.texSubImage2D(this.type, level, 0, 0, width, height, this.format, this.dataType, data);
        gl.bindTexture(this.type, null);
    }

    /**
     * activate texture for late usage.
     * warn: upload texture slot uniform after this while using webgl api
     *
     * @param slot texture slot
     */
    activate(slot: number): void {
        const gl = this.device.getContext<WebGL2RenderingContext>();
        gl.activeTexture(gl.TEXTURE0 + slot);
        gl.bindTexture(this.type, this.texture);
    }

    raw<T>(): T {
        return this.texture as T;
    }

    delete(): void {
        const gl = this.device.getContext<WebGL2RenderingContext>();
        gl.deleteTexture(this.texture);
    }
}
