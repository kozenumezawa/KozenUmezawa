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
    const N = 10; // emsemble
    this.deltaT = 0.5;
    this.maxValue = null;
    this.minValue = null;

    this.renderer = new THREE.WebGLRenderer({preserveDrawingBuffer: true});
    this.renderer.setSize(width, height);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10000);
    camera.position.set(60, 0, 180);
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

  getNumberOfParticles(cell) {
    const alpha = _.sum(cell.scalar) / 255.0 / cell.scalar.length;
    let rho = -Math.PI * this.deltaT / Math.log(1 - alpha);
    if (Math.random() < (rho % 1)) rho++; // if rho is 0.9, particle will be shown by 90% probabillity
    return Math.floor(rho / 2);
  }

  generateParticlesFromCubes(values) {
    [this.maxValue, this.minValue] = [_.max(values), _.min(values)];

    this.scenes.forEach((scene, idx) => {
      const particleCoords = [];
      const particleValues = [];
      const rhos = [];
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

            const v = this.getCoordsFromIndex(i, j, k);

            const cube = new cubeCell(...v);
            cube.setVertexScalar(...s);

            const rho = this.getNumberOfParticles(cube);
            _.times(rho, j => {
              // const particlePosition = cube.metropolisSampling(rho);
              const particlePosition = cube.randomSampling();
              particleCoords.push(...cube.localToGlobal(particlePosition));
              particleValues.push(cube.interpolateScalar(particlePosition));
              rhos.push(rho);
            });
          }
        }
      }
      console.log(_.sum(rhos));
      this.setVertexCoords(Float32Array.from(particleCoords), idx);
      this.setVertexValues(Float32Array.from(particleValues), Float32Array.from(rhos), idx);
      scene.add(new THREE.Points(this.geometries[idx], this.materials[idx]));
    });
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
