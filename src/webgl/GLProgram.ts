import { ShaderBucket } from "./ShaderBucket";

const include_pattern = /#include <.+?>/g;
const shader_name_pattern = /<(.+?)>/g;

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



    preProcess(source: string): string {
        const matches = source.match(include_pattern);
        if(matches) {
            for(let i = 0, il = matches.length; i < il; ++i) {
                const match_include = matches[i]
                const shader_name_match = match_include.match(shader_name_pattern)[0];
                const origin_source = ShaderBucket.request(shader_name_match.replace(/(<|>)/g, ''));
                source = source.replace(match_include, origin_source);
            }
        }
        console.log(matches, source);
        return source;
    }

    buildShader( source, type ) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, this.preProcess(source));
        this.gl.compileShader(shader);
        const shaderInfo = this.gl.getShaderInfoLog(shader);
        if ( shaderInfo != '') console.log('shader log info: ' + shaderInfo);
        return shader;
    }

    active() {
        this.gl.useProgram( this.program );
    }

}