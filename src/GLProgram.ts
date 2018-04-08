export class GLProgram {

    program:  WebGLProgram;

    constructor( public gl: WebGLRenderingContext, vs, fs, uniformList ) {
        this.program = gl.createProgram();
        gl.attachShader( this.program, this.buildShader( vs, gl.VERTEX_SHADER ));
        gl.attachShader( this.program, this.buildShader( fs, gl.FRAGMENT_SHADER ));
        gl.linkProgram( this.program );

        const attrs = Object.getOwnPropertyNames( uniformList );
        attrs.forEach( attr => {
            uniformList[attr] = gl.getUniformLocation( this.program, attr );
        });
    }

    buildShader( source, type ) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);
        const shaderInfo = this.gl.getShaderInfoLog(shader);
        if ( shaderInfo != '') console.log('shader log info: ' + shaderInfo);
        return shader;
    }

    active() {
        this.gl.useProgram( this.program );
    }

}