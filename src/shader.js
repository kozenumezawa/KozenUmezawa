module.exports = {
  fragmentShader: [
    "uniform vec3 diffuse;",
    "uniform float opacity;",

    THREE.ShaderChunk[ "common" ],
    THREE.ShaderChunk[ "color_pars_fragment" ],
    THREE.ShaderChunk[ "map_particle_pars_fragment" ],
    THREE.ShaderChunk[ "fog_pars_fragment" ],
    THREE.ShaderChunk[ "shadowmap_pars_fragment" ],
    THREE.ShaderChunk[ "logdepthbuf_pars_fragment" ],

    "void main() {",

    "  vec3 n;",
    "  n.xy = gl_PointCoord * 2.0 - 1.0;",
    "  n.z = 1.0 - dot( n.xy, n.xy );",
    "  if ( n.z < 0.0 ) discard;",

    "  vec3 outgoingLight = vec3( 0.0 );",
    "  vec4 diffuseColor = vec4( diffuse, opacity );",

    THREE.ShaderChunk[ "logdepthbuf_fragment" ],
    THREE.ShaderChunk[ "map_particle_fragment" ],
    THREE.ShaderChunk[ "color_fragment" ],
    THREE.ShaderChunk[ "alphatest_fragment" ],

    "	 outgoingLight = diffuseColor.rgb;",

    THREE.ShaderChunk[ "fog_fragment" ],

    "  gl_FragColor = vec4( outgoingLight, diffuseColor.a );",

    "}"
  ].join( "\n" )
}
