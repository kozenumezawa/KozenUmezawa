import THREE from 'three';

export default {
  vertexShader: [
    "attribute float valueData;",

    "uniform float alphaZero;",
    "uniform float rZero;",

    "uniform float maxValue;",
    "uniform float minValue;",

    "uniform sampler2D transferFunctionOpacity;",
    "uniform sampler2D transferFunctionColor;",
    ,
    "varying vec3 vColor;",

    "float getAlpha(){",
      "float index = (valueData - minValue) / (maxValue - minValue);",
      "vec4 valueMatrix = texture2D(transferFunctionOpacity, vec2( index , 0.0));",  //texture's coordinate is in the range [0.0, 1.0)
      "return valueMatrix.a;",
    "}",

    "vec3 getColor(){",
      "float index = (valueData - minValue) / (maxValue - minValue);",
      "vec4 colorMatrix = texture2D(transferFunctionColor, vec2( index , 0.0));",  //texture's coordinate is in the range [0.0, 1.0)
      "return colorMatrix.rgb;",
    "}",

    "void main() {",
      "vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);",
      "vColor.xyz = getColor();",
      "gl_PointSize = rZero * sqrt( log(1.0 - getAlpha()) / log(1.0 - alphaZero) ) * 10.0;",
      "gl_Position = projectionMatrix * mvPosition;",

    "}"
  ].join("\n"),

  fragmentShader: [
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
