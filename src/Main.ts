import { dom, t, rX, rY, i } from '../lib/lan';
import { HiddenScreen } from './HiddenScreen';
import { GLProgram } from './GLProgram';

import * as BasicVert from '../shaders/basic_vert.glsl';
import * as BasicFrag from '../shaders/basic_frag.glsl';
import * as PathTracingVert from '../shaders/path_tracing_vert.glsl';
import * as PathTracingFrag from '../shaders/path_tracing_frag.glsl';

export class Arch {

    gl: WebGLRenderingContext;
    ofSceeen;
    width: number;
    height: number;

    accum_count: number = 1;
    diff: boolean = true;
    abort: boolean = false;

    hiddenScreen: HiddenScreen;
    programTracing: GLProgram;
    programNormal: GLProgram;

    matrix: Float32Array;
    matrix2: Float32Array;
    viewportMV: Float32Array;

    tracingLocations = {
        MVP: null,
        proj: null,
        inseed: null,
        resolution: null
    };

    normalLocations = {
        accum: null,
        count: null,
        MVP: null
    };

    texture: WebGLTexture;

    vertexArray;

    angleHori = - Math.PI / 2;
    angleVer = Math.PI / 3;
    zoom = 0;

    status = dom('status') as HTMLDivElement;

    constructor(canvas: HTMLCanvasElement) {

        this.gl = canvas.getContext('webgl2') as WebGLRenderingContext;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        this.width = canvas.width;
        this.height = canvas.height;
        if (this.gl === undefined) {
            alert(' require webgl 2 ');
        }

        const ext = this.gl.getExtension('EXT_color_buffer_float');
        if (ext === undefined) {
            alert('vediocard require');
        }

        this.hiddenScreen = new HiddenScreen(this.gl, this.width, this.height);

        const gl = this.gl;

        const totX = 3;
        const totY = 3;
        const data = new Float32Array([
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,
            -1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
        ]);

        this.texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, (gl as any).RGB32F, totX, 1, 0, gl.RGB, gl.FLOAT, data);

        this.programTracing = new GLProgram(gl, PathTracingVert, PathTracingFrag, this.tracingLocations);
        this.programNormal = new GLProgram(gl, BasicVert, BasicFrag, this.normalLocations);

        // Setup the quad that will drive the rendering.
        const vertexPosBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, 1, 1, 0, -1, 1, 0, -1, -1, 0]), gl.STATIC_DRAW);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);

        this.vertexArray = (gl as any).createVertexArray();
        (gl as any).bindVertexArray(this.vertexArray);
        const vertexPosLocation = 0;
        gl.enableVertexAttribArray(vertexPosLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexPosBuffer);
        gl.vertexAttribPointer(vertexPosLocation, 3, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
        (gl as any).bindVertexArray(null);


        this.matrix = new Float32Array([0, 0, 1, 0,
            -0.86, 0.5, 0, 0,
            -0.5, -0.86, 0, 0,
            6.534, 19.32, 0, 1]);

        this.matrix2 = new Float32Array([1.77, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 0, -0.5,
            0, 0, 1, 0.5]);

        this.viewportMV = new Float32Array( this.matrix );

        canvas.oncontextmenu = function(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        canvas.onmousemove = (e) => {
            if ( !e.buttons ) return;
            if ( e.buttons == 1) {
                this.angleHori += e.movementX/100;
                this.angleVer += e.movementY/100;
            } else {
                this.zoom += e.movementX/10;
            }
            this.viewportMV = t(rX(rY(i(), this.angleHori),this.angleVer),[0,4,-20+this.zoom]);
            this.diff = true;
        }
    }

    render = () => {

        const gl = this.gl;

        if ( this.diff ) {
            this.matrix.set( this.viewportMV );
            this.hiddenScreen.bind();
            gl.clear( gl.COLOR_BUFFER_BIT );
            this.hiddenScreen.unbind();
            this.accum_count = 1;
            this.abort = false;
            this.diff = false;
        } 

        if ( !this.abort ) {
            // tracing
            this.hiddenScreen.bind();
                this.programTracing.active();
                gl.uniformMatrix4fv( this.tracingLocations.MVP, false, this.matrix );
                gl.uniformMatrix4fv( this.tracingLocations.proj, false, this.matrix2 );
                gl.uniform1f( this.tracingLocations.inseed, Math.random() );
                gl.uniform2fv( this.tracingLocations.resolution, new Float32Array([this.width, this.height]) );

                gl.activeTexture( gl.TEXTURE0 );
                gl.bindTexture( gl.TEXTURE_2D, this.texture );

                gl.enable( gl.BLEND );
                gl.blendFunc( gl.ONE, gl.ONE );
                (gl as any).bindVertexArray( this.vertexArray );
                gl.drawArrays( gl.TRIANGLES, 0, 6);
                (gl as any).bindVertexArray( null );
                gl.disable( gl.BLEND);
            this.hiddenScreen.unbind();

            // display
            this.programNormal.active();
            gl.uniform1i( this.normalLocations.accum, 0);
            gl.uniform1f( this.normalLocations.count, 1.0 / this.accum_count );
            gl.activeTexture( gl.TEXTURE0 );
            gl.bindTexture( gl.TEXTURE_2D, this.hiddenScreen.colorTexture );

            (gl as any).bindVertexArray( this.vertexArray );
            gl.drawArrays( gl.TRIANGLES, 0, 6);
            (gl as any).bindVertexArray( null );

            gl.bindTexture(gl.TEXTURE_2D, null);

            if( ++this.accum_count >= 100 ) this.abort = true;

            this.status.innerHTML = `sample count:${this.accum_count}`;
        }

        requestAnimationFrame(this.render);
    }



}

const arch = new Arch(dom('view') as HTMLCanvasElement);
arch.render();
