attribute float valueData;

uniform float alphaZero;
uniform float rZero;

uniform float maxValue;
uniform float minValue;

uniform sampler2D transferFunctionOpacity;
uniform sampler2D transferFunctionColor;

varying vec3 vColor;

float getAlpha(){
  float index = (valueData - minValue) / (maxValue - minValue);
  vec4 valueMatrix = texture2D(transferFunctionOpacity, vec2( index , 0.0));
  return valueMatrix.a;
}

vec3 getColor(){
  float index = (valueData - minValue) / (maxValue - minValue);
  vec4 colorMatrix = texture2D(transferFunctionColor, vec2( index , 0.0));
  return colorMatrix.rgb;
}

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vColor.xyz = getColor();
  gl_PointSize = rZero * sqrt( log(1.0 - getAlpha()) / log(1.0 - alphaZero) ) * 10.0;
  gl_Position = projectionMatrix * mvPosition;
}
