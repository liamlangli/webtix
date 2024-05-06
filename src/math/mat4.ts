import { Vector3 } from "./vector3";

let x: Vector3 = new Vector3();
let y: Vector3 = new Vector3();
let z: Vector3 = new Vector3();

const DEG_TO_RADIUS = 180 / Math.PI;

export class Matrix4 {
    elements: Float32Array = new Float32Array(16);

    constructor() {
        this.identity();
    }

    identity(): Matrix4 {
        this.elements.set([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        return this;
    }

    copy(matrix: Matrix4): Matrix4 {
        this.read(matrix.elements!);
        return this;
    }

    clone(): Matrix4 {
        return new Matrix4().read(this.elements!);
    }

    set(
        n11: number,
        n12: number,
        n13: number,
        n14: number,
        n21: number,
        n22: number,
        n23: number,
        n24: number,
        n31: number,
        n32: number,
        n33: number,
        n34: number,
        n41: number,
        n42: number,
        n43: number,
        n44: number,
    ): Matrix4 {
        const te = this.elements;
        te[0] = n11;
        te[4] = n12;
        te[8] = n13;
        te[12] = n14;
        te[1] = n21;
        te[5] = n22;
        te[9] = n23;
        te[13] = n24;
        te[2] = n31;
        te[6] = n32;
        te[10] = n33;
        te[14] = n34;
        te[3] = n41;
        te[7] = n42;
        te[11] = n43;
        te[15] = n44;
        return this;
    }

    read(array: Float32Array, offset?: number): Matrix4 {
        offset = offset === undefined ? 0 : offset;
        for (let i = 0; i < 16; ++i) {
            this.elements[i] = array[i + offset];
        }
        return this;
    }

    set_position(v: Vector3): Matrix4 {
        const te = this.elements;

        te[12] = v.x;
        te[13] = v.y;
        te[14] = v.z;

        return this;
    }

    make_position(v: Vector3): Matrix4 {
        this.set(1, 0, 0, v.x, 0, 1, 0, v.y, 0, 0, 1, v.z, 0, 0, 0, 1);
        return this;
    }

    transpose(): Matrix4 {
        const te = this.elements;
        let tmp;
        tmp = te[1];
        te[1] = te[4];
        te[4] = tmp;
        tmp = te[2];
        te[2] = te[8];
        te[8] = tmp;
        tmp = te[6];
        te[6] = te[9];
        te[9] = tmp;
        tmp = te[3];
        te[3] = te[12];
        te[12] = tmp;
        tmp = te[7];
        te[7] = te[13];
        te[13] = tmp;
        tmp = te[11];
        te[11] = te[14];
        te[14] = tmp;
        return this;
    }

    look_at(origin: Vector3, target: Vector3, up: Vector3): Matrix4 {
        const te = this.elements;

        z.copy(origin).sub(target);
        if (z.mag() === 0) {
            z.z = 1;
        }

        z.normalize();
        x.cross_vector(up, z);
        if (x.mag() === 0) {
            if (Math.abs(up.z) === 1) {
                z.x += 0.0001;
            } else {
                z.z += 0.0001;
            }
            z.normalize();
            x.cross_vector(up, z);
        }

        x.normalize();
        y.cross_vector(z, x);

        te[0] = x.x;
        te[4] = y.x;
        te[8] = z.x;
        te[1] = x.y;
        te[5] = y.y;
        te[9] = z.y;
        te[2] = x.z;
        te[6] = y.z;
        te[10] = z.z;

        return this;
    }

    inverse(m: Matrix4): Matrix4 {
        // based on http://www.euclideanspace.com/maths/algebra/matrix/functions/inverse/fourD/index.htm
        const te = this.elements,
            me = m.elements,
            n11 = me[0],
            n21 = me[1],
            n31 = me[2],
            n41 = me[3],
            n12 = me[4],
            n22 = me[5],
            n32 = me[6],
            n42 = me[7],
            n13 = me[8],
            n23 = me[9],
            n33 = me[10],
            n43 = me[11],
            n14 = me[12],
            n24 = me[13],
            n34 = me[14],
            n44 = me[15],
            t11 =
                n23 * n34 * n42 -
                n24 * n33 * n42 +
                n24 * n32 * n43 -
                n22 * n34 * n43 -
                n23 * n32 * n44 +
                n22 * n33 * n44,
            t12 =
                n14 * n33 * n42 -
                n13 * n34 * n42 -
                n14 * n32 * n43 +
                n12 * n34 * n43 +
                n13 * n32 * n44 -
                n12 * n33 * n44,
            t13 =
                n13 * n24 * n42 -
                n14 * n23 * n42 +
                n14 * n22 * n43 -
                n12 * n24 * n43 -
                n13 * n22 * n44 +
                n12 * n23 * n44,
            t14 =
                n14 * n23 * n32 -
                n13 * n24 * n32 -
                n14 * n22 * n33 +
                n12 * n24 * n33 +
                n13 * n22 * n34 -
                n12 * n23 * n34;

        const det = n11 * t11 + n21 * t12 + n31 * t13 + n41 * t14;
        if (det === 0) {
            return this.identity();
        }

        const detInv = 1 / det;

        te[0] = t11 * detInv;
        te[1] =
            (n24 * n33 * n41 -
                n23 * n34 * n41 -
                n24 * n31 * n43 +
                n21 * n34 * n43 +
                n23 * n31 * n44 -
                n21 * n33 * n44) *
            detInv;
        te[2] =
            (n22 * n34 * n41 -
                n24 * n32 * n41 +
                n24 * n31 * n42 -
                n21 * n34 * n42 -
                n22 * n31 * n44 +
                n21 * n32 * n44) *
            detInv;
        te[3] =
            (n23 * n32 * n41 -
                n22 * n33 * n41 -
                n23 * n31 * n42 +
                n21 * n33 * n42 +
                n22 * n31 * n43 -
                n21 * n32 * n43) *
            detInv;

        te[4] = t12 * detInv;
        te[5] =
            (n13 * n34 * n41 -
                n14 * n33 * n41 +
                n14 * n31 * n43 -
                n11 * n34 * n43 -
                n13 * n31 * n44 +
                n11 * n33 * n44) *
            detInv;
        te[6] =
            (n14 * n32 * n41 -
                n12 * n34 * n41 -
                n14 * n31 * n42 +
                n11 * n34 * n42 +
                n12 * n31 * n44 -
                n11 * n32 * n44) *
            detInv;
        te[7] =
            (n12 * n33 * n41 -
                n13 * n32 * n41 +
                n13 * n31 * n42 -
                n11 * n33 * n42 -
                n12 * n31 * n43 +
                n11 * n32 * n43) *
            detInv;

        te[8] = t13 * detInv;
        te[9] =
            (n14 * n23 * n41 -
                n13 * n24 * n41 -
                n14 * n21 * n43 +
                n11 * n24 * n43 +
                n13 * n21 * n44 -
                n11 * n23 * n44) *
            detInv;
        te[10] =
            (n12 * n24 * n41 -
                n14 * n22 * n41 +
                n14 * n21 * n42 -
                n11 * n24 * n42 -
                n12 * n21 * n44 +
                n11 * n22 * n44) *
            detInv;
        te[11] =
            (n13 * n22 * n41 -
                n12 * n23 * n41 -
                n13 * n21 * n42 +
                n11 * n23 * n42 +
                n12 * n21 * n43 -
                n11 * n22 * n43) *
            detInv;

        te[12] = t14 * detInv;
        te[13] =
            (n13 * n24 * n31 -
                n14 * n23 * n31 +
                n14 * n21 * n33 -
                n11 * n24 * n33 -
                n13 * n21 * n34 +
                n11 * n23 * n34) *
            detInv;
        te[14] =
            (n14 * n22 * n31 -
                n12 * n24 * n31 -
                n14 * n21 * n32 +
                n11 * n24 * n32 +
                n12 * n21 * n34 -
                n11 * n22 * n34) *
            detInv;
        te[15] =
            (n12 * n23 * n31 -
                n13 * n22 * n31 +
                n13 * n21 * n32 -
                n11 * n23 * n32 -
                n12 * n21 * n33 +
                n11 * n22 * n33) *
            detInv;

        return this;
    }

    make_perspective(
        fov: number,
        aspect: number,
        near: number,
        far: number,
    ): Matrix4 {
        this.identity();
        const te = this.elements;

        const top = near * Math.tan(DEG_TO_RADIUS * 0.5 * fov);
        const bottom = -top;
        const left = top * aspect;
        const right = -left;

        const x = (2 * near) / (right - left);
        const y = (2 * near) / (top - bottom);

        const a = (right + left) / (right - left);
        const b = (top + bottom) / (top - bottom);
        const c = -(far + near) / (far - near);
        const d = (-2 * far * near) / (far - near);

        te[0] = x;
        te[4] = 0;
        te[8] = a;
        te[12] = 0;
        te[1] = 0;
        te[5] = y;
        te[9] = b;
        te[13] = 0;
        te[2] = 0;
        te[6] = 0;
        te[10] = c;
        te[14] = d;
        te[3] = 0;
        te[7] = 0;
        te[11] = -1;
        te[15] = 0;

        return this;
    }

    multiply_matrix(a: Matrix4, b: Matrix4): Matrix4 {
        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;

        const a11 = ae[0],
            a12 = ae[4],
            a13 = ae[8],
            a14 = ae[12];
        const a21 = ae[1],
            a22 = ae[5],
            a23 = ae[9],
            a24 = ae[13];
        const a31 = ae[2],
            a32 = ae[6],
            a33 = ae[10],
            a34 = ae[14];
        const a41 = ae[3],
            a42 = ae[7],
            a43 = ae[11],
            a44 = ae[15];

        const b11 = be[0],
            b12 = be[4],
            b13 = be[8],
            b14 = be[12];
        const b21 = be[1],
            b22 = be[5],
            b23 = be[9],
            b24 = be[13];
        const b31 = be[2],
            b32 = be[6],
            b33 = be[10],
            b34 = be[14];
        const b41 = be[3],
            b42 = be[7],
            b43 = be[11],
            b44 = be[15];

        te[0] = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[4] = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[8] = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        te[1] = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5] = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[9] = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[2] = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[6] = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        te[3] = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[7] = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return this;
    }

    multiply(m: Matrix4): Matrix4 {
        return this.multiply_matrix(this, m);
    }

    scale(v: Vector3): Matrix4 {
        const te = this.elements;
        const x = v.x,
            y = v.y,
            z = v.z;

        te[0] *= x;
        te[4] *= y;
        te[8] *= z;
        te[1] *= x;
        te[5] *= y;
        te[9] *= z;
        te[2] *= x;
        te[6] *= y;
        te[10] *= z;
        te[3] *= x;
        te[7] *= y;
        te[11] *= z;

        return this;
    }

    preMultiply(m: Matrix4): Matrix4 {
        return this.multiply_matrix(m, this);
    }
}
