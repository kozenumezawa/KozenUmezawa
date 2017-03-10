attribute float valueData;
attribute float alphaZero;

uniform float rZero;

uniform float maxValue;
uniform float minValue;

uniform sampler2D transferFunctionOpacity;

varying vec3 vColor;

float getAlpha(){
  float index = (valueData - minValue) / (maxValue - minValue);
  vec4 valueMatrix = texture2D(transferFunctionOpacity, vec2(index , 0.0));
  return valueMatrix.a;
}

vec3 getColor(){
  float index = (valueData - minValue) / (maxValue - minValue);
  vec3 c = vec3((1.0 - index) * 0.75, 1.0, 1.0);
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vColor.xyz = getColor();
  gl_PointSize = rZero * sqrt(log(1.0 - getAlpha()) / log(1.0 - alphaZero)) / -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
