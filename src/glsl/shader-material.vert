const float PI = 3.14159265;

attribute float valueData;
attribute float rho;

varying vec3 vColor;

float getAlpha() {
  return valueData / 255.0;
}

float getR() {
  return sqrt(-log(1.0 - getAlpha()) / 0.5 / PI / 1000.0);
}

vec3 getColor() {
  vec3 c = vec3((1.0 - valueData / 255.0) * 0.75, 1.0, 1.0);
  vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
  return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vColor.xyz = getColor();
  gl_PointSize = 3000.0 * getR() / -mvPosition.z;
  gl_Position = projectionMatrix * mvPosition;
}
