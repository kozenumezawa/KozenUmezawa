//  cube's vertices are defined as follows:
//
//      N3-----N2     N0=(0,0,1)  (=(p,q,r))
//     /     /
//    N0----N1 |
//     |    |  |
//     |    |  N6
//    N4----N5

import baseCell from './base-cell';

export default class cubeCell extends baseCell {
  constructor(v0, v1, v2, v3, v4, v5, v6, v7) {
    super();
    this.V = [v0, v1, v2, v3, v4, v5, v6, v7]; //  coordinates
    this.vertices = 8;
  }

  setVertexScalar(s0, s1, s2, s3, s4, s5, s6, s7) {
    this.scalar = [s0, s1, s2, s3, s4, s5, s6, s7]; //  scalar
  }

  setVertexAlpha(a0, a1, a2, a3, a4, a5, a6, a7) {
    this.alpha = [a0, a1, a2, a3, a4, a5, a6, a7]; //  scalar
  }

  getInterpolationFunctions(local) {
    const p = local[0];
    const q = local[1];
    const r = local[2];

    const N = new Array(this.vertices);

    N[0] = (1 - p) * (1 - q) * r;
    N[1] = p * (1 - q) * r;
    N[2] = p * q * r;
    N[3] = (1 - p) * q * r;
    N[4] = (1 - p) * (1 - q) * (1 - r);
    N[5] = p * (1 - q) * (1 - r);
    N[6] = p * q * (1 - r);
    N[7] = (1 - p) * q * (1 - r);
    return N;
  }

  randomSampling() {
    const p = Math.random();
    const q = Math.random();
    const r = Math.random();
    const local = new Array(3);

    local[0] = p;
    local[1] = q;
    local[2] = r;
    return local;
  }

  calculateVolume() {
    const a = [this.V[1][0] - this.V[0][0], this.V[1][1] - this.V[0][1], this.V[1][2] - this.V[0][2]];
    const b = [this.V[2][0] - this.V[0][0], this.V[2][1] - this.V[0][1], this.V[2][2] - this.V[0][2]];

    const vectorProduct = this.vectorproduct(a, b);
    const S1 = Math.sqrt(Math.pow(vectorProduct[0], 2) + Math.pow(vectorProduct[1], 2) + Math.pow(vectorProduct[2], 2));
    return S1 * this.distance(this.V[0], this.V[4]);
  }
}
