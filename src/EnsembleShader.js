import THREE from 'three';

export default{
	uniforms: {
		"tDiffuse1": { type: "t", value: null },
	},

	vertexShader: [

		"varying vec2 vUv;",

		"void main() {",

		"vUv = uv;",
		"gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

		"}"

	].join( "\n" ),

	fragmentShader: [

		"uniform float opacity;",
		"uniform sampler2D tDiffuse1;",

		"varying vec2 vUv;",

		"void main() {",

		"gl_FragColor = texture2D(tDiffuse1, vUv);",

		"}"

	].join( "\n" )

};
