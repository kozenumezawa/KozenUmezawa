// hexahedral's vertices are defined as follows:
//        N2---N3      N0=(0,0,1)  (=(p,q,r))
//       /     /|      N1=(1,0,1)
//      /     / |      N2=(0,1,1)
//    N0----N1  |      N3=(1,1,1)
//    |     |  N7      N4=(0,0,0)
//    |     | /        N5=(1,0,0)
//    N4----N5         N6=(0,1,0)
//                     N7=(1,1,0)
//
//In the hexahedral cell, constructor dont't have to check vertex's positional relation

import baseCell from './base-cell'

export default class hexahedralCell extends baseCell{
  constructor(v0, v1, v2, v3, v4, v5, v6, v7) {
    this.V = [ v0, v1, v2, v3, v4, v5, v6, v7 ];    //  coordinates
    this.vertices = 8;
    this.volume = this.calculateVolume();
  }

  setVertexScalar(s0, s1, s2, s3, s4, s5, s6, s7) {
    this.scalar = [ s0, s1, s2, s3, s4, s5, s6, s7 ];    //  scalar
  }
  
  getInterpolationFunctions(local) {
    const p = local[0];
    const q = local[1];
    const r = local[2];

    const pq = p * q;
    const qr = q * r;
    const rp = r * p;
    const pqr = pq * r;

    let N = new Array(this.vertices);
    N[0] = r - rp - qr + pqr;
    N[1] = rp - pqr;
    N[2] = pqr;
    N[3] = qr - pqr;
    N[4] = 1 - p - q - r +pq + qr + rp - pqr;
    N[5] = p - pq - rp + pqr;
    N[6] = pq - pqr;
    N[7] = q - pq - qr + pqr;

    return N;
  }
  
  randomSampling() {
    let p = Math.random();
    let q = Math.random();
    let r = Math.random();
    let local = new Array(3);

    if(p + q > 1) {
      local[0] = 1 - p;
      local[1] = 1 - q;
      local[2] = r;
    }else {
      local[0] = p;
      local[1] = q;
      local[2] = r;
    }
    return local;
  }
  
  calculateVolume() {
    //Requirement: vertex V[0], V[1], V[2], V[3] configure a quadrangle and distance of V[0] and V[4] denotes height.
    let a = [this.V[1][0] - this.V[0][0], this.V[1][1] - this.V[0][1], this.V[1][2] - this.V[0][2]];
    let b = [this.V[2][0] - this.V[0][0], this.V[2][1] - this.V[0][1], this.V[2][2] - this.V[0][2]];

    let vectorProduct = this.vectorproduct(a, b);
    
    let S1 = Math.sqrt(Math.pow(vectorProduct[0], 2) + Math.pow(vectorProduct[1], 2) + Math.pow(vectorProduct[2], 2));
    return S1 * this.distance(this.V[0], this.V[4]);
  }
  
}

