class Correlation {
	constructor(){
	}

	//input
	setComparison(A, B){
		this.A = A;
		this.B = B;
		return this;
	}

	setLag(lag){
		this.lag = lag;
		return this;
	}

	//calc
	covariance(A, B){
		let l = A.length;
		let A_Sum = A.reduce((a, b) => a + b, 0);
		let B_Sum = B.reduce((a, b) => a + b, 0);
		let A_Average = A_Sum / l;
		let B_Average = B_Sum / l;
		let result = 0;
		for(let i = 0; i < l; i++){
			result = result + (A[i] - A_Average) * (B[i] - B_Average);
		}
		return result;
	}

	standard(A, B){
		let l = A.length;
		let A_Sum = A.reduce((a, b) => a + b, 0);
		let B_Sum = B.reduce((a, b) => a + b, 0);
		let A_Average = A_Sum / l;
		let B_Average = B_Sum / l;
		let X = 0;
		let Y = 0;
		for(let i = 0; i < l; i++){
			X += Math.pow(A[i] - A_Average, 2);
			Y += Math.pow(B[i] - B_Average, 2);
		}
		let result = Math.pow(X*Y, 1/2);
		return result;
	}

	calc(A, B, lag){
		const sampleAmount = A.length > B.length ? B.length : A.length;
		let sampleA = A.slice(0, sampleAmount - lag);
		let sampleB = B.slice(lag, sampleAmount);
		return this.covariance(sampleA, sampleB) / this.standard(sampleA, sampleB);
	}

	//output
	getResult(){
		if(this.A.length <= lag || this.B.length <= lag) throw new Error("Invalid comparison data length.");
		return this.calc(this.A, this.B, this.lag);
	}
}

//for sample
function correlation(A, B, lag){
	return new Correlation().setComparison(A, B).setLag(lag).getResult();
}
