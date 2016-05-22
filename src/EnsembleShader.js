import THREE from 'three';

export default{
	uniforms: {
		"tDiffuse1": { type: "t", value: null },
		"tDiffuse2": { type: "t", value: null },
		"tDiffuse3": { type: "t", value: null },
		"tDiffuse4": { type: "t", value: null },
		"tDiffuse5": { type: "t", value: null },
		"tDiffuse6": { type: "t", value: null },
		"tDiffuse7": { type: "t", value: null },
		"tDiffuse8": { type: "t", value: null },
		"tDiffuse9": { type: "t", value: null },
		"tDiffuse10": { type: "t", value: null }
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
		"uniform sampler2D tDiffuse3;",
		"uniform sampler2D tDiffuse4;",
		"uniform sampler2D tDiffuse5;",
		"uniform sampler2D tDiffuse6;",
		"uniform sampler2D tDiffuse7;",
		"uniform sampler2D tDiffuse8;",
		"uniform sampler2D tDiffuse9;",
		"uniform sampler2D tDiffuse10;",

		"varying vec2 vUv;",

		"void main() {",

		"gl_FragColor = texture2D(tDiffuse1, vUv) + texture2D(tDiffuse2, vUv) + texture2D(tDiffuse3, vUv) + texture2D(tDiffuse4, vUv) + texture2D(tDiffuse5, vUv) + texture2D(tDiffuse6, vUv) + texture2D(tDiffuse7, vUv)+ texture2D(tDiffuse8, vUv)+ texture2D(tDiffuse9, vUv)+ texture2D(tDiffuse10, vUv);",

		"}"
	].join( "\n" )

};
