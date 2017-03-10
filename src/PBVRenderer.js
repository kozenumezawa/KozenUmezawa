import _ from 'lodash';
import EnsembleAveragePass from 'three-ensemble-average-pass';

const THREE = require('three');
const stats = new(require('stats.js'))();
const OrbitControls = require('three-orbit-controls')(THREE);
const EffectComposer = require('three-effectcomposer')(THREE);

import prismCell from './lib/prism-cell';
import cubeCell from './lib/cube-cell';
import helper from './helper';

const once = _.once(console.log);

export default class PBVRenderer {
  constructor(width, height) {
    const N = 1; // emsemble
    this.deltaT = 1.0;
    this.rZero = null;
    this.maxValue = null;
    this.minValue = null;

    this.renderer = new THREE.WebGLRenderer({
      preserveDrawingBuffer: true
    });
    this.renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 10000);
    camera.position.set(180, 0, 0);

    window.camera = camera;

    this.geometries = _.range(N).map(i => new THREE.BufferGeometry());
    this.materials = _.range(N).map(i => this.getShaderMaterialInstance());
    this.scenes = _.range(N).map(i => new THREE.Scene());

    this.postProcess(camera);

    this.animate = this.animate.bind(this);
    this.controls = new OrbitControls(camera, this.renderer.domElement);
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.composer.render();
    stats.update();
  }

  getShaderMaterialInstance() {
    return new THREE.ShaderMaterial({
      uniforms: {
        rZero: {
          type: 'f',
          value: 0
        },
        maxValue: {
          type: 'f',
          value: 0
        },
        minValue: {
          type: 'f',
          value: 0
        },
        transferFunctionOpacity: {
          type: 't',
          value: 0
        }
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
      if (idx == this.scenes.length - 1) effect.renderToScreen = true;
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
  getNumberOfParticles(cell, opacity) {
    const oldRange = this.maxValue - this.minValue;
    const newRange = opacity.length;
    const alphas = cell.scalar.map(s => opacity[Math.floor(((s - this.minValue) * newRange) / oldRange)]);
    const alphaZero = _.clamp(_.mean(alphas), 0, this.getMaxAlpha());
    cell.setVertexAlpha(...alphas);
    let rho = -Math.log(1 - alphaZero) / (Math.PI * Math.pow(this.rZero, 2) * this.deltaT);
    if (Math.random() < (rho % 1)) rho++; // if rho is 0.9, particle will be shown by 90% probabillity
    return Math.floor(rho);
  }

  getCoordsFromIndex(idx) {
    const maxX = 120; // XXX: TERRIBLE
    const maxY = 120;
    const x = Math.floor(idx / (maxX * maxY));
    idx -= maxX * maxY * x;
    let y = Math.floor(idx / maxY);
    idx -= maxY * y;
    let z = idx;
    y -= 60;
    z -= 60;
    return [
      [x, y, -z],
      [x + 1, y, -z],
      [x + 1, y + 1, -z],
      [x, y + 1, -z],
      [x, y, -z + 1],
      [x + 1, y, -z + 1],
      [x + 1, y + 1, -z + 1],
      [x, y + 1, -z + 1],
    ];
  }

  generateParticlesFromCubes(values, params) {
    this.updateAllMaxMinValue(values);
    this.updateRZero(values);

    this.scenes.forEach((scene, idx) => {
      const particleCoords = [];
      const particleValues = [];
      const particleAlphaZeros = [];

      _.times(values.length, i => {
        const v = this.getCoordsFromIndex(i);
        const s = _.range(8).map(j => values[i]);

        const cube = new cubeCell(...v);
        cube.setVertexScalar(...s);

        const rho = values[i] === 0 ? 0 : this.getNumberOfParticles(cube, params.opacity);

        _.times(rho, j => {
          const particlePosition = cube.randomSampling();
          particleCoords.push(...cube.localToGlobal(particlePosition));
          particleValues.push(cube.interpolateScalar(particlePosition));
          particleAlphaZeros.push(cube.interpolateAlpha(particlePosition));
        });
      });
      this.setVertexCoords(Float32Array.from(particleCoords), idx);
      this.setVertexValues(Float32Array.from(particleValues), idx);
      this.setVertexAlphaZeros(Float32Array.from(particleAlphaZeros), idx);
      scene.add(new THREE.Points(this.geometries[idx], this.materials[idx]));
    });

    this.updateTransferFunction(params);
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

  updateTransferFunction(params) {
    this.materials.forEach(m => {
      m.uniforms.transferFunctionOpacity.value = this.getTransferFunctionOpacity(params.opacity);
    });
  }

  getTransferFunctionOpacity(opacity) {
    const width = opacity.length;
    const height = 1;
    const data = Float32Array.from(opacity);
    return this.createDataTexture(data, width, height, THREE.AlphaFormat);
  }

  updateAllMaxMinValue(values) {
    [this.maxValue, this.minValue] = [_.max(values), _.min(values)];
    this.materials.forEach(m => {
      m.uniforms.maxValue.value = this.maxValue;
      m.uniforms.minValue.value = this.minValue;
    });
  }

  updateRZero(values) {
    this.rZero = 0.04;
    this.materials.forEach(m => {
      m.uniforms.rZero.value = this.rZero;
    });
  }
}
