import THREE from 'three';

module.exports = {
  vertexShader: [
    "attribute float radius;",

    THREE.ShaderChunk["common"],
    THREE.ShaderChunk["color_pars_vertex"],
    THREE.ShaderChunk["shadowmap_pars_vertex"],
    THREE.ShaderChunk["logdepthbuf_pars_vertex"],

    "void main() {",

    THREE.ShaderChunk["color_vertex"],
    THREE.ShaderChunk["begin_vertex"],
    THREE.ShaderChunk["project_vertex"],

    // THREE.ShaderChunk["logdepthbuf_vertex"],
    // THREE.ShaderChunk["worldpos_vertex"],
    // THREE.ShaderChunk["shadowmap_vertex"],

    "  gl_PointSize = radius * 5.0;",

    "}",
  ].join("\n"),

  fragmentShader: [
    "uniform vec3 diffuse;",

    THREE.ShaderChunk["common"],
    THREE.ShaderChunk["color_pars_fragment"],
    // THREE.ShaderChunk["map_particle_pars_fragment"],
    // THREE.ShaderChunk["fog_pars_fragment"],
    // THREE.ShaderChunk["shadowmap_pars_fragment"],
    // THREE.ShaderChunk["logdepthbuf_pars_fragment"],

    "void main() {",
    "  vec3 n;",
    "  n.xy = gl_PointCoord * 2.0 - 1.0;",
    "  n.z = 1.0 - dot( n.xy, n.xy );",
    "  if ( n.z < 0.0 ) discard;",

    "  vec4 diffuseColor = vec4(diffuse, 1.0);",

    // THREE.ShaderChunk["logdepthbuf_fragment"],
    // THREE.ShaderChunk["map_particle_fragment"],
    THREE.ShaderChunk["color_fragment"],
    // THREE.ShaderChunk["alphatest_fragment"],

    // THREE.ShaderChunk["fog_fragment"],

    "  gl_FragColor = diffuseColor;",

    "}"
  ].join("\n")
}
