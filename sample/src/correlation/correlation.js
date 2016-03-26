function getSum(A,B,sumfunction) {
	var sum  = 0.0;
	for (var i=0 ; i<A.length ; i++){
		sum = sum + sumfunction(A[i],B[i]);
	}
	return sum;
}

function correlation(A,B,lag) {
	if ( A.length > B.length) {
		var arraylength = B.length;
	} else {
		var arraylength = A.length;
	}

  if (arraylength <= lag) {
      throw new Error("ERROR! Data length is too few.");
  }

	A = A.slice(0,arraylength-lag);
	B = B.slice(lag,arraylength);


	var numerator_tmp = getSum(A,B,function(a,b) { return a*b;}) - 
		getSum(A,A,function(a,b) {return a;})* getSum(B,B,function(a,b) { return a;})/A.length;

	var denominator_subfunc = function(A) {
		var ret = getSum(A,A,function(a,b) { return a*b;}) - 
			Math.pow(getSum(A,A,function(a,b) { return a;}),2)/A.length;
		return ret;
	};
	var denominator_tmp = 
		Math.pow(denominator_subfunc(A),0.5)*Math.pow(denominator_subfunc(B),0.5);

	var r = numerator_tmp / denominator_tmp;
	return r;

}
