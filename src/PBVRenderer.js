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
    const N = 20; // emsemble
    this.maxValue = null;
    this.minValue = null;

    this.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    this.renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    camera.position.set(60, 0, 160);
    window.camera = camera;

    this.geometries = _.range(N).map(i => new THREE.BufferGeometry());
    this.materials = _.range(N).map(i => this.getShaderMaterialInstance());
    this.scenes = _.range(N).map(i => new THREE.Scene());

    this.postProcess(camera);

    this.animate = this.animate.bind(this);
    this.controls = new OrbitControls(camera, this.renderer.domElement);
    this.controls.target = new THREE.Vector3(60, 60, 0);
  }

  animate() {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.composer.render();
    stats.update();
  }

  getShaderMaterialInstance() {
    return new THREE.ShaderMaterial({
      uniforms: {rZero: {type: 'f', value: 0}},
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

  getCoordsFromIndex(x, y, z) {
    return [
      [x + 1, y, z],
      [x, y, z],
      [x, y + 1, z],
      [x + 1, y + 1, z],
      [x + 1, y, z + 1],
      [x, y, z + 1],
      [x, y + 1, z + 1],
      [x + 1, y + 1, z + 1],
    ];
  }

  getAdaptiveNumberOfParticles(cell) {
    const alpha = _.sum(cell.scalar) / 255.0 / cell.scalar.length;
    let rho = Math.pow((-Math.PI * 0.5) / Math.log(1 - alpha), 1/3.0); // cube root!
    // let rho = -Math.PI * 0.5 / Math.log(1 - alpha);
    if (Math.random() < (rho % 1)) rho++; // if rho is 0.9, particle will be shown by 90% probabillity
    return Math.floor(rho);
  }

  getMaxAlpha() {
    const maxDensity = 1 / (8 * Math.pow(this.rZero, 3));
    return 1 - Math.exp(-Math.PI * Math.pow(this.rZero, 2) * maxDensity * 0.5);
  }

  // AlphaZero will be calculated as an average value of prism coordinates,
  // and it must not exceed the maximum alpha value
  getNumberOfParticles(cell) {
    const alphas = cell.scalar.map(s => s / 255.0);
    const alphaZero = _.clamp(_.sum(alphas) / alphas.length, 0, this.getMaxAlpha());
    cell.setVertexAlpha(...alphas);
    let rho = -Math.log(1 - alphaZero) / (Math.PI * Math.pow(this.rZero, 2) * 0.5);
    if(Math.random() < (rho % 1)) rho++; // if rho is 0.9, particle will be shown by 90% probabillity
    return Math.floor(rho);
  }

  generateParticlesFromCubes(values) {
    [this.maxValue, this.minValue] = [_.max(values), _.min(values)];
    this.rZero = 0.20; // used only for old PBR
    this.materials.forEach(m => { m.uniforms.rZero.value = this.rZero; });

    this.scenes.forEach((scene, idx) => {
      const [particleCoords, particleValues, rhos] = [[], [], []];
      const particleAlphaZeros = [];
      for(let k=0; k<33; k++) {
        console.log(`${idx} scenes, ${k} layers.`);
        for(let j=0; j<119; j++) {
          for(let i=0; i<119; i++) {
            const s = [
              values[k*120*120 + j*120 + (i+1)],
              values[k*120*120 + j*120 + i],
              values[k*120*120 + (j+1)*120 + i],
              values[k*120*120 + (j+1)*120 + (i+1)],
              values[(k+1)*120*120 + j*120 + (i+1)],
              values[(k+1)*120*120 + j*120 + i],
              values[(k+1)*120*120 + (j+1)*120 + i],
              values[(k+1)*120*120 + (j+1)*120 + (i+1)],
            ];
            if(s.reduce((a, b) => a+b, 0) === 0) continue;

            const cube = new cubeCell(...this.getCoordsFromIndex(i, j, k));
            cube.setVertexScalar(...s);

            // old PBR
            // const rho = this.getNumberOfParticles(cube);

            // new PBR
            const rho = this.getAdaptiveNumberOfParticles(cube);

            _.times(rho, j => {
              const particlePosition = cube.randomSampling();
              particleCoords.push(...cube.localToGlobal(particlePosition));
              particleValues.push(cube.interpolateScalar(particlePosition));
              // old PBR
              // particleAlphaZeros.push(cube.interpolateAlpha(particlePosition));

              // new PBR
              rhos.push(rho);
            });
          }
        }
      }
      this.setVertexCoords(Float32Array.from(particleCoords), idx);
      this.setVertexValues(Float32Array.from(particleValues), Float32Array.from(rhos), idx);
      this.setVertexAlphaZeros(Float32Array.from(particleAlphaZeros), idx);
      if(this.scenes.length - 1 === idx)
        console.log(`About ${particleValues.length} particles in each scenes.`);
      scene.add(new THREE.Points(this.geometries[idx], this.materials[idx]));
    });
  }

  setVertexAlphaZeros(alphaZeros, idx) {
    this.geometries[idx].addAttribute('alphaZero', new THREE.BufferAttribute(alphaZeros, 1));
  }

  setVertexCoords(coords, idx) {
    this.geometries[idx].addAttribute('position', new THREE.BufferAttribute(coords, 3));
  }

  setVertexValues(values, rhos, idx) {
    this.geometries[idx].addAttribute('value', new THREE.BufferAttribute(values, 1));
    this.geometries[idx].addAttribute('rho', new THREE.BufferAttribute(rhos, 1));
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
}
