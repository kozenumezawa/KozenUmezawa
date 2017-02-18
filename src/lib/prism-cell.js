//  prism's vertices are defined as follows:
//        N2          N0=(0,0,1)  (=(p,q,r))
//       / \          N1=(1,0,1)
//      /  \          N2=(0,1,1)
//    N0----N1        N3=(0,0,0)
//    |     |         N4=(1,0,0)
//    |     |         N5=(0,1,0)
//    N3----N4
//
//  So constructor have to check vertex's positional relation
//  and exchange vertices number if it is wrong. (Incomplete)
//
//   This class has two functions to calculate a cell's volume.
//  'calculateVolume' is faster than 'calculateVolumeUseJacobian' but
//  'calculateVolume' has requirements.
//  Requirement: vertex V[0], V[1], V[2] configure a triangle and distance of V[0] and V[3] denotes height.

import baseCell from './base-cell';

export default class prismCell extends baseCell {
  constructor(v0, v1, v2, v3, v4, v5) {
    super();
    this.V = [v0, v1, v2, v3, v4, v5]; //  coordinates
    this.vertices = 6;
  }

  setVertexScalar(s0, s1, s2, s3, s4, s5) {
    this.scalar = [s0, s1, s2, s3, s4, s5]; //  scalar
  }

  setVertexAlpha(a0, a1, a2, a3, a4, a5) {
    this.alpha = [a0, a1, a2, a3, a4, a5]; //  scalar
  }

  getInterpolationFunctions(local) {
    const p = local[0];
    const q = local[1];
    const r = local[2];

    const N = new Array(this.vertices);

    N[0] = (1 - p - q) * r;
    N[1] = p * r;
    N[2] = q * r;
    N[3] = (1 - p - q) * (1 - r);
    N[4] = p * (1 - r);
    N[5] = q * (1 - r);

    return N;
  }

  randomSampling() {
    const p = Math.random();
    const q = Math.random();
    const r = Math.random();
    const local = new Array(3);

    if (p + q > 1) {
      local[0] = 1 - p;
      local[1] = 1 - q;
      local[2] = r;
    } else {
      local[0] = p;
      local[1] = q;
      local[2] = r;
    }
    return local;
  }

  calculateVolume() {
    //  Requirement: vertex V[0], V[1], V[2] configure a triangle and distance of V[0] and V[3] denotes height.
    const a = [this.V[1][0] - this.V[0][0], this.V[1][1] - this.V[0][1], this.V[1][2] - this.V[0][2]];
    const b = [this.V[2][0] - this.V[0][0], this.V[2][1] - this.V[0][1], this.V[2][2] - this.V[0][2]];

    const vectorProduct = this.vectorproduct(a, b);
    const S1 = Math.sqrt(Math.pow(vectorProduct[0], 2) + Math.pow(vectorProduct[1], 2) + Math.pow(vectorProduct[2], 2)) * 0.5;
    return S1 * this.distance(this.V[0], this.V[3]);
  }

  calculateVolumeUseJacobian() {
    const N = 9;
    const P = [
      [0.3, 0.3, 0.2],
      [0.6, 0.3, 0.2],
      [0.3, 0.6, 0.2],
      [0.3, 0.3, 0.5],
      [0.6, 0.3, 0.5],
      [0.3, 0.6, 0.5],
      [0.3, 0.3, 0.8],
      [0.6, 0.3, 0.8],
      [0.3, 0.6, 0.8]
    ];

    let S = 0;
    for (let i = 0; i < N; i++) {
      const J = this.jacobian(P[i]);
      S += Math.abs(0.5 * this.determinant(J));
    }
    return S / N;
  }

  differentialFunction(local) {
    const p = local[0];
    const q = local[1];
    const r = local[2];

    const dNdp = new Array(this.vertices);
    const dNdq = new Array(this.vertices);
    const dNdr = new Array(this.vertices);

    dNdp[0] = -r;
    dNdp[1] = r;
    dNdp[2] = 0;
    dNdp[3] = -(1 - r);
    dNdp[4] = (1 - r);
    dNdp[5] = 0;

    dNdq[0] = -r;
    dNdq[1] = 0;
    dNdq[2] = r;
    dNdq[3] = -(1 - r);
    dNdq[4] = 0;
    dNdq[5] = (1 - r);

    dNdr[0] = (1 - p - q);
    dNdr[1] = p;
    dNdr[2] = q;
    dNdr[3] = -(1 - p - q);
    dNdr[4] = -p;
    dNdr[5] = -q;

    return [dNdp, dNdq, dNdr];
  }
}
