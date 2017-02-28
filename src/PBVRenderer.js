import _ from 'lodash';
import EnsembleAveragePass from 'three-ensemble-average-pass';

const THREE = require('three');
const stats = new (require('stats.js'))();
const OrbitControls = require('three-orbit-controls')(THREE);
const EffectComposer = (require('three-effectcomposer'))(THREE);

import prismCell from './lib/prism-cell';
import helper from './helper';

export default class PBVRenderer {
  constructor (width, height) {
    const N = 1; // emsemble
    this.deltaT = 1.0;
    this.rZero = null;
    this.maxValue = null;
    this.minValue = null;

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(helper.getPixelRatio());
    this.renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    camera.position.z = 70;

    this.geometries = Array(N).fill(new THREE.BufferGeometry());
    this.materials = Array(N).fill(this.getShaderMaterialInstance());
    this.scenes = Array(N).fill(new THREE.Scene());

    this.postProcess(camera);

    this.animate = this.animate.bind(this);
    this.controls = new OrbitControls(camera, this.renderer.domElement);
  }

  animate () {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.composer.render();
    stats.update();
  }

  getShaderMaterialInstance() {
    return new THREE.ShaderMaterial({
      uniforms: {
        rZero: {type: 'f', value: 0},
        maxValue: {type: 'f', value: 0},
        minValue: {type: 'f', value: 0},
        transferFunctionOpacity: {type: 't', value: 0},
        transferFunctionColor : {type: 't', value: 0}
      },
      vertexColors: THREE.VertexColors,
      vertexShader: require('./glsl/shader-material.vert'),
      fragmentShader: require('./glsl/shader-material.frag'),
    });
  }

  postProcess(camera) {
    const size = _.mapValues(this.renderer.getSize(), v => v * helper.getPixelRatio());
    const renderTarget = new THREE.WebGLRenderTarget(size.width, size.height, {
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      wrapT: THREE.ClampToEdgeWrapping,
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      anisotropy: this.renderer.getMaxAnisotropy(),
      stencilBuffer: false
    });
    this.composer = new EffectComposer(this.renderer, renderTarget);
    this.composer.addPass(new EffectComposer.ShaderPass({
      vertexShader: require('./glsl/effect-composer.vert'),
      fragmentShader: require('./glsl/effect-composer.frag')
    }));
    this.scenes.forEach((scene, idx) => {
      const effect = new EnsembleAveragePass(scene, camera, this.scenes.length);
      if(idx == this.scenes.length - 1) effect.renderToScreen = true;
      this.composer.addPass(effect);
    });
  }

  getFramesPerSecond() {
    return stats.domElement.innerText.split(' ')[0];
  }

  getMaxAlpha() {
    const maxDensity = 1 / (8 * Math.pow(this.rZero, 3));
    return 1 - Math.exp(-Math.PI * Math.pow(this.rZero, 2) * maxDensity * this.deltaT);
  }

  // AlphaZero will be calculated as an average value of prism coordinates,
  // and it must not exceed the maximum alpha value
  getNumberOfParticles(prism, opacity) {
    const oldRange = this.maxValue - this.minValue;
    const newRange = opacity.length;
    const alphas = prism.scalar.map(s => opacity[Math.floor(((s - this.minValue) * newRange) / oldRange)]);
    const alphaZero = _.clamp(_.sum(alphas) / alphas.length, 0, this.getMaxAlpha());
    prism.setVertexAlpha(...alphas);
    let rho = -Math.log(1 - alphaZero) / (Math.PI * Math.pow(this.rZero, 2) * this.deltaT);
    if(Math.random() < (rho % 1)) rho++; // if rho is 0.9, particle will be shown by 90% probabillity
    return Math.floor(rho);
  }

  // What should we do on this function:
  // 1. Generate prisms from six each coordinates
  // 2. Caluculate how many particles should be generated with ρ
  // 3. Put particles inside each prisms
  // 4. Repeat N times
  generateParticlesFromPrism(coords, values, connects, params) {
    this.updateAllMaxMinValue(values);
    this.updateRZero(values);

    this.scenes.forEach((scene, idx) => {
      const particleCoords = [];
      const particleValues = [];
      const particleAlphaZeros = [];

      _.times(connects.length / 6, i => {
        const v = _.range(6).map(j => this.getCoord(coords, connects[i*6 + j]));
        const s = _.range(6).map(j => values[connects[i*6 + j]]);

        const prism = new prismCell(...v);
        prism.setVertexScalar(...s);

        const rho = this.getNumberOfParticles(prism, params.opacity);

        _.times(rho, j => {
          const particlePosition = prism.randomSampling();
          particleCoords.push(...prism.localToGlobal(particlePosition));
          particleValues.push(prism.interpolateScalar(particlePosition));
          particleAlphaZeros.push(prism.interpolateAlpha(particlePosition));
        });
      });
      this.setVertexCoords(Float32Array.from(particleCoords), idx);
      this.setVertexValues(Float32Array.from(particleValues), idx);
      this.setVertexAlphaZeros(Float32Array.from(particleAlphaZeros), idx);
      scene.add(new THREE.Points(this.geometries[idx], this.materials[idx]));
    });

    this.updateTransferFunction(params);
  }

  getCoord(data, idx) {
    return [data[idx * 3 + 0], data[idx * 3 + 1], data[idx * 3 + 2]];
  }

  setVertexCoords(coords, idx) {
    this.geometries[idx].addAttribute('position', new THREE.BufferAttribute(coords, 3));
  }

  setVertexValues(values, idx) {
    this.geometries[idx].addAttribute('valueData', new THREE.BufferAttribute(values, 1));
  }

  setVertexAlphaZeros(alphaZeros, idx) {
    this.geometries[idx].addAttribute('alphaZero', new THREE.BufferAttribute(alphaZeros, 1));
  }

  createDataTexture(data, width, height, format) {
    const texture = new THREE.DataTexture(data, width, height, format, THREE.FloatType);
    texture.generateMipmaps = false;
    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.wrapS = THREE.ClampToEdgeWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    texture.needsUpdate = true;
    return texture;
  }

  updateTransferFunction(params){
    this.materials.forEach(m => {
      m.uniforms.transferFunctionOpacity.value = this.getTransferFunctionOpacity(params.opacity);
      m.uniforms.transferFunctionColor.value = this.getTransferFunctionColor(params.spectrum);
    });
  }

  getTransferFunctionOpacity(opacity){
    const width = opacity.length;
    const height = 1;
    const data = Float32Array.from(opacity);
    return this.createDataTexture(data, width, height, THREE.AlphaFormat);
  }

  getTransferFunctionColor(spectrum){
    const width = spectrum.length;
    const height = 1;
    const data = Float32Array.from(_.flatten(spectrum));
    return this.createDataTexture(data, width, height, THREE.RGBAFormat);
  }

  updateAllMaxMinValue(values) {
    [this.maxValue, this.minValue] = [_.max(values), _.min(values)];
    this.materials.forEach(m => {
      m.uniforms.maxValue.value = this.maxValue;
      m.uniforms.minValue.value = this.minValue;
    });
  }

  updateRZero(values) {
    this.rZero = 0.5;
    this.materials.forEach(m => {
      m.uniforms.rZero.value = this.rZero;
    });
  }
}
