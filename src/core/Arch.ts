import { dom, t, rX, rY, i } from '../lib/lan';
import { HiddenScreen } from '../webgl/HiddenScreen';
import { GLProgram } from '../webgl/GLProgram';
import { OBJLoader } from '../loaders/OBJLoader';
import * as BasicVert from '../shaders/basic_vert.glsl';
import * as BasicFrag from '../shaders/basic_frag.glsl';
import * as PathTracingVert from '../shaders/path_tracing_vert.glsl';
import * as PathTracingFrag from '../shaders/path_tracing_frag.glsl';
import { BVH } from '../accelerator/BVH';
import { Scene } from '../core/Scene';
import { Texture_Width } from '../Constants';
import { QuickSort, InsertionSort } from '../accelerator/Accelerator';
import { sceneTest } from '../utils/Test';

export class Arch {

    scene: Scene;

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
        incount: null,
        resolution: null, 
        acceleratorInfo: null,     
        accelerator: null,          // tunnel 0
        primitiveInfo: null,
        primitives: null,                // tunnel 1
        vertexInfo: null,
        vertices: null,             // tunnel 2
        normalInfo: null,
        normals: null,              // tunnel 3
        materialInfo: null,
        materials: null,             // tunnel 4
        useEnvmap: null,
        envmap: null                // tunnel 5
    };

    normalLocations = {
        accum: null,
        count: null,
        MVP: null
    };

    primitiveTexture: WebGLTexture; // deprecated
    acceleratorTexture: WebGLTexture;
    faceTexture: WebGLTexture;
    vertexTexture: WebGLTexture;
    normalTexture: WebGLTexture;
    materialTexture: WebGLTexture;

    envMapTexture: WebGLTexture;

    vertexArray;

    angleHori = - Math.PI / 2;
    angleVer = Math.PI / 3;
    zoom = 0;

    status = dom('status') as HTMLDivElement;

    sampleCount = 140;

    constructor(canvas: HTMLCanvasElement) {

        this.gl = canvas.getContext('webgl2', {preserveDrawingBuffer: true}) as WebGLRenderingContext;
        const ratio = Math.max(window.devicePixelRatio, 2.0);
        this.width = canvas.width * ratio;
        this.height = canvas.height * ratio;
        canvas.width = this.width;
        canvas.height = this.height;
        if (this.gl === undefined) {
            alert(' require webgl 2 ');
        }

        const ext = this.gl.getExtension('EXT_color_buffer_float');
        if (ext === undefined) {
            alert('vediocard require');
        }

        this.hiddenScreen = new HiddenScreen(this.gl, this.width, this.height);

        const gl = this.gl;

        this.matrix = new Float32Array([0, 0, 1, 0,
            -0.86, 0.5, 0, 0,
            -0.5, -0.86, 0, 0,
            10.0, 19.32, 0, 1]);

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
                this.angleVer = Math.min(Math.max(this.angleVer, 0.01), Math.PI / 2 - 0.01);
            } 
            this.viewportMV = t(rX(rY(i(), this.angleHori),this.angleVer),[0, 0, -20 + this.zoom]);
            this.diff = true;
        }

        canvas.onmousewheel = (e) => {
            this.zoom += e.wheelDelta / 120;
            this.zoom = Math.min(18.0, this.zoom);
            console.log(this.zoom);
            this.viewportMV = t(rX(rY(i(), this.angleHori),this.angleVer),[0, 0, -20 + this.zoom]);
            this.diff = true;
        }
    }

    private boundData(vertices: Float32Array) {
        const size = vertices.length / 12;
    }

    bindScene( scene: Scene ) {
        this.scene = scene;
        console.log(scene);

        const gl = this.gl;

        this.acceleratorTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, this.acceleratorTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, (gl as any).RGB32F, scene.accelerateBuffer.width, scene.accelerateBuffer.height, 0, gl.RGB, gl.FLOAT, scene.accelerateBuffer.data);

        this.faceTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, this.faceTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, (gl as any).RGB32F, scene.faceBuffer.width, scene.faceBuffer.height, 0, gl.RGB, gl.FLOAT, scene.faceBuffer.data);

        this.vertexTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.vertexTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, (gl as any).RGB32F, scene.vertexBuffer.width, scene.vertexBuffer.height, 0, gl.RGB, gl.FLOAT, scene.vertexBuffer.data);

        this.normalTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, this.normalTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, (gl as any).RGB32F, scene.normalBuffer.width, scene.normalBuffer.height, 0, gl.RGB, gl.FLOAT, scene.normalBuffer.data);

        this.materialTexture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE4);
        gl.bindTexture(gl.TEXTURE_2D, this.materialTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, (gl as any).RGB32F, scene.materialBuffer.width, scene.materialBuffer.height, 0, gl.RGB, gl.FLOAT, scene.materialBuffer.data);

        if (scene.envMap !== undefined) {
            this.envMapTexture = gl.createTexture();
            gl.activeTexture(gl.TEXTURE5);
            gl.bindTexture(gl.TEXTURE_2D, this.envMapTexture);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, this.scene.envMap);    
        }

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
                gl.uniform1i( this.tracingLocations.incount, this.accum_count % 200 );
                gl.uniform2fv( this.tracingLocations.resolution, new Float32Array([this.width, this.height]) );

                gl.uniform3fv( this.tracingLocations.acceleratorInfo, this.scene.accelerateBuffer.genInfoBuffer());
                gl.uniform3fv( this.tracingLocations.primitiveInfo, this.scene.faceBuffer.genInfoBuffer());
                gl.uniform3fv( this.tracingLocations.vertexInfo, this.scene.vertexBuffer.genInfoBuffer());
                gl.uniform3fv( this.tracingLocations.normalInfo, this.scene.normalBuffer.genInfoBuffer());
                gl.uniform3fv( this.tracingLocations.materialInfo, this.scene.materialBuffer.genInfoBuffer());

                gl.uniform1i( this.tracingLocations.accelerator, 0);
                gl.uniform1i( this.tracingLocations.primitives, 1);
                gl.uniform1i( this.tracingLocations.vertices, 2);
                gl.uniform1i( this.tracingLocations.normals, 3);
                gl.uniform1i( this.tracingLocations.materials, 4);

                if (this.scene.envMap !== undefined) {
                    gl.uniform1i( this.tracingLocations.envmap, 5);

                    gl.activeTexture( gl.TEXTURE5 );
                    gl.bindTexture( gl.TEXTURE_2D, this.envMapTexture );

                    gl.uniform1f( this.tracingLocations.useEnvmap, 1.0);
                } else {
                    gl.uniform1f( this.tracingLocations.useEnvmap, 0.0);
                }
                
                gl.activeTexture( gl.TEXTURE0 );
                gl.bindTexture( gl.TEXTURE_2D, this.acceleratorTexture );

                gl.activeTexture( gl.TEXTURE1 );
                gl.bindTexture( gl.TEXTURE_2D, this.faceTexture );

                gl.activeTexture( gl.TEXTURE2 );
                gl.bindTexture( gl.TEXTURE_2D, this.vertexTexture );
                
                gl.activeTexture( gl.TEXTURE3 );
                gl.bindTexture( gl.TEXTURE_2D, this.normalTexture );

                gl.activeTexture( gl.TEXTURE4 );
                gl.bindTexture( gl.TEXTURE_2D, this.materialTexture );

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

            if( ++this.accum_count >= this.sampleCount ) this.abort = true;

            this.status.innerHTML = `sample count:${this.accum_count}<br>face count:${this.scene.faceCount}`;
        }

        requestAnimationFrame(this.render);
    }
}
