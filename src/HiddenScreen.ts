export class HiddenScreen {

    colorTexture;
    depthBuffer;
    frameBuffer;

    constructor( public gl:WebGLRenderingContext, public width: number, public height: number ) {
        this.colorTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, this.colorTexture);
        gl.texImage2D(gl.TEXTURE_2D, 0, (gl as any).RGBA32F, width, height, 0, gl.RGBA, gl.FLOAT, null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.bindTexture(gl.TEXTURE_2D, null);

        this.depthBuffer = gl.createRenderbuffer();
        gl.bindRenderbuffer(gl.RENDERBUFFER, this.depthBuffer);
        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        this.frameBuffer = gl.createFramebuffer();
        gl.bindFramebuffer(gl.FRAMEBUFFER, this.frameBuffer);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.colorTexture, 0);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.depthBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    bind() {
        this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, this.frameBuffer );
        this.gl.viewport(0,0,this.width,this.height);
    }

    unbind() {
        this.gl.bindFramebuffer( this.gl.FRAMEBUFFER, null );
    }

    delete() {
        this.gl.deleteRenderbuffer( this.depthBuffer );
        this.gl.deleteFramebuffer( this.frameBuffer );
        this.gl.deleteTexture( this.colorTexture );
    }
}