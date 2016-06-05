import THREE from 'three';

export default {
  vertexShader: [
    "attribute float value;",

    "uniform float alphaZero;",
    "uniform float rZero;",

    "uniform float maxValue;",
    "uniform float minValue;",

    "uniform sampler2D transferFunctionOpacity;",
    "uniform sampler2D transferFunctionColor;",

    "varying vec3 vColor;",
    
    "float getAlpha(){",
      "float index = (value - minValue) / (maxValue - minValue);",
      "vec4 valueMatrix = texture2D(transferFunctionOpacity, vec2(index , 0.0));",  //texture's coordinate is in the range [0.0, 1.0)
      "return valueMatrix.a;",
    "}",

    "void main() {",
      "vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
      "vColor.xyz = color.xyz;",

      "gl_PointSize = rZero * sqrt( log(1.0 - getAlpha()) / log(1.0 - alphaZero) ) * (100.0 / -mvPosition.z);",
      "gl_Position = projectionMatrix * mvPosition;",

    "}"
  ].join("\n"),

  fragmentShader: [
    //THREE.ShaderChunk["common"],

    "varying vec3 vColor;",
    "void main() {",
    "  vec3 n;",
    "  n.xy = gl_PointCoord * 2.0 - 1.0;",
    "  n.z = 1.0 - dot( n.xy, n.xy );",
    "  if ( n.z < 0.0 ) discard;",

    "  vec4 diffuseColor = vec4(1.0, 1.0, 1.0, 1.0);",
    "  diffuseColor.rgb *= vColor;",
    "  gl_FragColor = diffuseColor;",

    "}"
  ].join("\n")
}
