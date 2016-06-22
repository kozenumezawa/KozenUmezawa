// prism's vertices are defined as follows:
//        N2          N0=(0,0,1)  (=(p,q,r))
//       / \          N1=(1,0,1)
//      /  \          N2=(0,1,1)
//    N0----N1        N3=(0,0,0)
//    |     |         N4=(1,0,0)
//    |     |         N5=(0,1,0)
//    N3----N4
//
//So constructor have to check vertex's positional relation
//and exchange vertices number if it is wrong. (Incomplete)

export default class prismCell {
  constructor(v0, v1, v2, v3, v4, v5, s0, s1, s2, s3, s4, s5) {
    this.V = [ v0, v1, v2, v3, v4, v5 ];    //  coordinates
    this.S = [ s0, s1, s2, s3, s4, s5 ];    //  scalar
    this.vertices = 6;
    this.volume = this.calculateVolume();
  }

  localToGlobal(local) {
    let x = 0;
    let y = 0;
    let z = 0;

    const N = this.getInterpolationFunctions(local);

    for (let i = 0; i < this.vertices; i++) {
      x += N[ i ] * this.V[ i ][ 0 ];
      y += N[ i ] * this.V[ i ][ 1 ];
      z += N[ i ] * this.V[ i ][ 2 ];
    }

    const global = [ x, y, z ];
    return global;
  }

  globalToLocal (global) {
    const E = 0.0001;    //Convergence condition
    let X = global;
    let x0 = [0.5, 0.5 * global[1] / global[0], 0.5 * global[2] / global[0]];   //  initial value of local coordinates

    const maxLoop = 10;
    let i;
    for(i = 0; i < maxLoop; i++){
      let X0 = this.localToGlobal(x0);
      let dX = this.minus_1_1(X, X0);
      let J = this.jacobian(x0);
      let dx = this.multiply_3_1(this.inverse(this.transpose(J)), dX);  //  CAUTION: we have to transpose

      if(Math.sqrt(dx[0] * dx[0] + dx[1] * dx[1] + dx[2] * dx[2]) < E)
        break;

      x0[0] += dx[0];
      x0[1] += dx[1];
      x0[2] += dx[2];
    }
    if(i == maxLoop){
      console.log('error is happen in globalToLocal');
    }
    return x0;
  }

  getInterpolationFunctions(local) {
    const p = local[0];
    const q = local[1];
    const r = local[2];

    let N = new Array(this.vertices);

    N[ 0 ] = (1 - p - q) * r;
    N[ 1 ] = p * r;
    N[ 2 ] = q * r;
    N[ 3 ] = (1 - p - q) * (1 - r);
    N[ 4 ] = p * (1 - r);
    N[ 5 ] = q * (1 - r);

    return N;
  }

  interpolateScalar(local) {
    let N = this.getInterpolationFunctions(local);

    let S = 0;
    for(let i = 0; i < this.vertices; i++){
      S += N[i] * this.S[i];
    }
    return S;
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
    //Requirement: vertex V[0], V[1], V[2] configure a triangle and distance of V[0] and V[3] denotes height.
    let a = [this.V[1][0] - this.V[0][0], this.V[1][1] - this.V[0][1], this.V[1][2] - this.V[0][2]];
    let b = [this.V[2][0] - this.V[0][0], this.V[2][1] - this.V[0][1], this.V[2][2] - this.V[0][2]];

    let vectorProduct = [a[1] * b[2] - a[2] * b[1],
                         a[2] * b[0] - a[0] * b[2],
                         a[0] * b[1] - a[1] * b[0]];
    let S1 = Math.sqrt(Math.pow(vectorProduct[0], 2) + Math.pow(vectorProduct[1], 2) + Math.pow(vectorProduct[2], 2))* 0.5;
    return S1 * this.distance(this.V[0], this.V[3]);
  }

  differentialFunction(local) {
    const p = local[0];
    const q = local[1];
    const r = local[2];

    let dNdp = new Array(this.vertices);
    let dNdq = new Array(this.vertices);
    let dNdr = new Array(this.vertices);

    dNdp[0] = -r;
    dNdp[1] =  r;
    dNdp[2] =  0;
    dNdp[3] = -( 1 - r );
    dNdp[4] =  ( 1 - r );
    dNdp[5] =  0;

    dNdq[0] = -r;
    dNdq[1] =  0;
    dNdq[2] =  r;
    dNdq[3] = -( 1 - r );
    dNdq[4] =  0;
    dNdq[5] =  ( 1 - r );

    dNdr[0] =  ( 1 - p - q );
    dNdr[1] =  p;
    dNdr[2] =  q;
    dNdr[3] = -( 1 - p - q );
    dNdr[4] = -p;
    dNdr[5] = -q;

    let dN = [dNdp, dNdq, dNdr];
    return dN;
  }

  jacobian(local) {
    let dN = this.differentialFunction(local);  //dN = [dNdp[6], dNdq[6], dNdr[6]]

    let dxdp = 0;
    let dydp = 0;
    let dzdp = 0;
    for(let i = 0; i < this.vertices; i++){
      dxdp += dN[0][i] * this.V[i][0];
      dydp += dN[0][i] * this.V[i][1];
      dzdp += dN[0][i] * this.V[i][2];
    }

    let dxdq = 0;
    let dydq = 0;
    let dzdq = 0;
    for(let i = 0; i < this.vertices; i++){
      dxdq += dN[1][i] * this.V[i][0];
      dydq += dN[1][i] * this.V[i][1];
      dzdq += dN[1][i] * this.V[i][2];
    }

    let dxdr = 0;
    let dydr = 0;
    let dzdr = 0;
    for(let i = 0; i < this.vertices; i++){
      dxdr += dN[2][i] * this.V[i][0];
      dydr += dN[2][i] * this.V[i][1];
      dzdr += dN[2][i] * this.V[i][2];
    }

    const jacobiMatrix = [[dxdp, dydp, dzdp], [dxdq, dydq, dzdq], [dxdr, dydr, dzdr]];
    return jacobiMatrix;
  }

  distance(A, B) {
    let r;
    r = Math.sqrt(Math.pow(A[0] - B[0], 2) + Math.pow(A[1] - B[1], 2) + Math.pow(A[2] - B[2], 2));
    return r;
  }

  determinant(A) {
    const a0 = A[0][0] * A[1][1] * A[2][2];
    const a1 = A[1][0] * A[2][1] * A[0][2];
    const a2 = A[2][0] * A[0][1] * A[1][2];

    const b0 = A[0][2] * A[1][1] * A[2][0];
    const b1 = A[1][2] * A[2][1] * A[0][0];
    const b2 = A[2][2] * A[0][1] * A[1][0];

    return a0 + a1 + a2 - b0 - b1 - b2;
  }


  inverse(A) {
    let Ainv = [];
    Ainv[0] = new Array(3);
    Ainv[1] = new Array(3);
    Ainv[2] = new Array(3);
    const detA_inv = 1 / this.determinant(A);

    Ainv[0][0] = detA_inv * (A[1][1] * A[2][2] - A[1][2] * A[2][1]);
    Ainv[0][1] = detA_inv * (A[0][2] * A[2][1] - A[0][1] * A[2][2]);
    Ainv[0][2] = detA_inv * (A[0][1] * A[1][2] - A[0][2] * A[1][1]);

    Ainv[1][0] = detA_inv * (A[1][2] * A[2][0] - A[1][0] * A[2][2]);
    Ainv[1][1] = detA_inv * (A[0][0] * A[2][2] - A[0][2] * A[2][0]);
    Ainv[1][2] = detA_inv * (A[0][2] * A[1][0] - A[0][0] * A[1][2]);

    Ainv[2][0] = detA_inv * (A[1][0] * A[2][1] - A[1][1] * A[2][0]);
    Ainv[2][1] = detA_inv * (A[0][1] * A[2][0] - A[0][0] * A[2][1]);
    Ainv[2][2] = detA_inv * (A[0][0] * A[1][1] - A[0][1] * A[1][0]);

    return Ainv;
  }

  transpose(A) {
    let At = [];
    At[0] = new Array(3);
    At[1] = new Array(3);
    At[2] = new Array(3);

    At[0][0] = A[0][0];
    At[0][1] = A[1][0];
    At[0][2] = A[2][0];

    At[1][0] = A[0][1];
    At[1][1] = A[1][1];
    At[1][2] = A[2][1];

    At[2][0] = A[0][2];
    At[2][1] = A[1][2];
    At[2][2] = A[2][2];

    return At;
  }

  multiply_3_1(A, B) {
    let C = new Array(3);
    C[0] = A[0][0] * B[0] + A[0][1] * B[1] + A[0][2] * B[2];
    C[1] = A[1][0] * B[0] + A[1][1] * B[1] + A[1][2] * B[2];
    C[2] = A[2][0] * B[0] + A[2][1] * B[1] + A[2][2] * B[2];
    return C;
  }

  minus_1_1(A, B) {
    let C = new Array(3);
    C[0] = A[0] - B[0];
    C[1] = A[1] - B[1];
    C[2] = A[2] - B[2];
    return C;
  }

}

