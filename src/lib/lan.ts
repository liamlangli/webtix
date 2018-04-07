export function dom(id) {
    return document.getElementById(id);
};

export const MouseKey = {
    None: -1,
    Left: 0,
    Middle: 1,
    Right: 2
};

export function m(a,b) { for (var i in b) a[i]=b[i]; return a; }
// helpers .. 
export function rX(m, angle) {
  var s=Math.sin(angle),c=Math.cos(angle),a10=m[4],a11=m[5],a12=m[6],a13=m[7],a20=m[8],a21=m[9],a22=m[10],a23=m[11];
  m[4]=a10*c+a20*s;m[5]=a11*c+a21*s;m[6]=a12*c+a22*s;m[7]=a13*c+a23*s;
  m[8]=a10*-s+a20*c;m[9]=a11*-s+a21*c;m[10]=a12*-s+a22*c;m[11]=a13*-s+a23*c;
  return m;
};
export function rY(m, angle) {
  var s=Math.sin(angle),c=Math.cos(angle),a00=m[0],a01=m[1],a02=m[2],a03=m[3],a20=m[8],a21=m[9],a22=m[10],a23=m[11];
  m[0]=a00*c+a20*-s;m[1]=a01*c+a21*-s;m[2]=a02*c+a22*-s;m[3]=a03*c+a23*-s;
  m[8]=a00*s+a20*c;m[9]=a01*s+a21*c;m[10]=a02*s+a22*c;m[11]=a03*s+a23*c;
  return m;
};
export function t(m,v) {
  var x=v[0],y=v[1],z=v[2];
  m[12]=m[0]*x+m[4]*y+m[8]*z+m[12];
  m[13]=m[1]*x+m[5]*y+m[9]*z+m[13];
  m[14]=m[2]*x+m[6]*y+m[10]*z+m[14];
  m[15]=m[3]*x+m[7]*y+m[11]*z+m[15];
  return m;
}
export function i() { return new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]) };