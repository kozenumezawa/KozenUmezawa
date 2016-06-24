//  hexahedral's vertices are defined as follows:
//        N3---N2      N0=(0,0,1)  (=(p,q,r))
//       /     /|      N1=(1,0,1)
//      /     / |      N2=(1,1,1)
//    N0----N1  |      N3=(0,1,1)
//    |     |  N6      N4=(0,0,0)
//    |     | /        N5=(1,0,0)
//    N4----N5         N6=(1,1,0)
//                     N7=(0,1,0)
//
//  So constructor have to check vertex's positional relation
//  and exchange vertices number if it is wrong. (Incomplete)
//
//   This class has two functions to calculate a cell's volume.
//  'calculateVolume' is faster than 'calculateVolumeUseJacobian' but
//  'calculateVolume' has requirements.
//  Requirement: vertex V[0], V[1], V[2], V[3] configure a quadrangle and distance of V[0] and V[4] denotes height.

import baseCell from './base-cell'

export default class hexahedralCell extends baseCell{
  constructor(v0, v1, v2, v3, v4, v5, v6, v7) {
    super();
    this.V = [ v0, v1, v2, v3, v4, v5, v6, v7 ];    //  coordinates
    this.vertices = 8;
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
    N[4] = 1 - p - q - r + pq + qr + rp - pqr;
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

    local[0] = p;
    local[1] = q;
    local[2] = r;

    return local;
  }
  
  calculateVolume() {
    //  Requirement: vertex V[0], V[1], V[2], V[3] configure a quadrangle and distance of V[0] and V[4] denotes height.
    const a = [this.V[1][0] - this.V[0][0], this.V[1][1] - this.V[0][1], this.V[1][2] - this.V[0][2]];
    const b = [this.V[2][0] - this.V[0][0], this.V[2][1] - this.V[0][1], this.V[2][2] - this.V[0][2]];

    const vectorProduct = this.vectorproduct(a, b);
    
    const S1 = Math.sqrt(Math.pow(vectorProduct[0], 2) + Math.pow(vectorProduct[1], 2) + Math.pow(vectorProduct[2], 2));
    return S1 * this.distance(this.V[0], this.V[4]);
  }

  calculateVolumeUseJacobian() {
    const resolution = 3;
    const samplingLength = 1 / resolution;
    const adjustment = samplingLength * 0.5;

    const samplingPosition = [-adjustment, -adjustment, -adjustment];

    let sumMetric = 0;
    for(let i = 0; i < resolution; i++){
      samplingPosition[2] += samplingLength;

      for(let j = 0; j < resolution; j++){
        samplingPosition[1] += samplingLength;

        for(let k = 0; k < resolution; k++){
          samplingPosition[0] += samplingLength;
          const J = this.jacobian(samplingPosition);
          const metricElement = this.determinant(J);

          sumMetric += Math.abs(metricElement);
        }
        samplingPosition[0] = -adjustment;
      }
      samplingPosition[1] = -adjustment;
    }

    return sumMetric / Math.pow(resolution, 3);
  }

  differentialFunction(local) {
    const p = local[0];
    const q = local[1];
    const r = local[2];
    const pq = p * q;
    const qr = q * r;
    const rp = r * p;

    let dNdp = new Array(this.vertices);
    let dNdq = new Array(this.vertices);
    let dNdr = new Array(this.vertices);

    dNdp[0] =  -r + qr;
    dNdp[1] =  r - qr;
    dNdp[2] =  qr;
    dNdp[3] =  -qr;
    dNdp[4] =  -1 + q + r - qr;
    dNdp[5] =  1 - q - r + qr;
    dNdp[6] =  q - qr;
    dNdp[7] =  -q + qr;

    dNdq[0] =  -r + rp;
    dNdq[1] =  -rp;
    dNdq[2] =  rp;
    dNdq[3] =  r - rp;
    dNdq[4] =  -1 + p + r - rp;
    dNdq[5] =  -p + rp;
    dNdq[6] =  p - rp;
    dNdq[7] =  1 - p - r + rp;

    dNdr[0] =  1 - q - p + pq;
    dNdr[1] =  p - pq;
    dNdr[2] =  pq;
    dNdr[3] =  q - pq;
    dNdr[4] =  -1 + q + p - pq;
    dNdr[5] =  -p + pq;
    dNdr[6] =  -pq;
    dNdr[7] =  -q + pq;

    let dN = [dNdp, dNdq, dNdr];
    return dN;
  }
}

