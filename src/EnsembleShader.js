import THREE from 'three';

export default{
		uniforms: {
			"tDiffuse1": { type: "t", value: null },
			"tDiffuse2": { type: "t", value: null },
			"N_INV"    : { type: "f", value: 1}
    },

		vertexShader: [

			"varying vec2 vUv;",

			"void main() {",

			"vUv = uv;",
			"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

			"}"

		].join( "\n" ),

		fragmentShader: [
      "uniform sampler2D tDiffuse1;",
			"uniform sampler2D tDiffuse2;",
			"uniform float N_INV;",
			
			"varying vec2 vUv;",

			"void main() {",

			"vec4 texel1 = texture2D( tDiffuse1, vUv );",
			"vec4 texel2 = texture2D( tDiffuse2, vUv );",

			"if(N_INV < 0.5){",
				"texel2 = vec4(texel2.xyz*N_INV,1);",
			"}else{",
				"texel1 = vec4(texel1.xyz*N_INV,1);",
				"texel2 = vec4(texel2.xyz*N_INV,1);",
			"}",
			"vec4 texel = vec4(texel1.x+texel2.x, texel1.y+texel2.y, texel1.z+texel2.z, 1);",
			"gl_FragColor = texel1 + texel2;",
			"}"

		].join( "\n" )

	};