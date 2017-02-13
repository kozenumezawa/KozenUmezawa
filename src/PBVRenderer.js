import _ from 'lodash';

import Stats from 'stats.js';
const THREE = require('three');
const OrbitControls = require('three-orbit-controls')(THREE);

import getEffectComposer from 'three-effectcomposer';
const EffectComposer = getEffectComposer(THREE);
import EnsembleAveragePass from 'three-ensemble-average-pass';

import prismCell from './lib/prism-cell';
import helper from './helper';

export default class PBVRenderer {
  constructor (width, height) {
    this.N = 2; // emsemble
    this.deltaT = 0.05;
    this.alphaZero = 0.2;
    this.rZero = 0.1;

    this.animate = this.animate.bind(this);

    this.renderer = new THREE.WebGLRenderer();
    this.renderer.setPixelRatio(helper.getPixelRatio());
    this.renderer.setSize(width, height);

    this.stats = new Stats();

    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    this.camera.position.z = 70;

    //prepare points and scene with the same number of N
    this.geometry = _.range(this.N).map(i => new THREE.BufferGeometry());
    this.material = _.range(this.N).map(i => this.getShaderMaterialInstance());
    this.points = _.range(this.N).map(i => new THREE.Points(this.geometry[i], this.material[i]));
    this.scene = _.range(this.N).map(i => new THREE.Scene());
    this.kvsml = _.range(this.N).map(i => ({maxValue: 0, minValue: 1}));

    this.postProcess();

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
  }

  animate () {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.stats.update();
    this.composer.render();
  }

  getShaderMaterialInstance() {
    return new THREE.ShaderMaterial(_.assign(THREE.ShaderLib['points'], {
      uniforms: {
        alphaZero: {type: 'f', value: this.alphaZero},
        rZero: {type: 'f', value: this.rZero},
        maxValue: {type: 'f', value: 100},
        minValue: {type: 'f', value: 0.001},
        transferFunctionOpacity: {type: 't', value: 0.1},
        transferFunctionColor : {type: 't', value: 0.1}
      },
      vertexColors: THREE.VertexColors,
      vertexShader: require('./glsl/shader-material-vertex.glsl'),
      fragmentShader: require('./glsl/shader-material-fragment.glsl'),
    }));
  }

  postProcess() { //Add EffectComposer to ralize a Postprocess
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
      vertexShader: require('./glsl/effect-composer-vertex.glsl'),
      fragmentShader: require('./glsl/effect-composer-fragment.glsl')
    }));
    this.scene.forEach((element,idx) => {
      const effect = new EnsembleAveragePass(this.scene[idx], this.camera, this.N);
      if(idx == this.N - 1) effect.renderToScreen = true;
      this.composer.addPass(effect);
    });
  }

  getBaseDencity() {
    return -Math.log(1 - this.alphaZero) / (Math.PI * this.rZero * this.rZero * this.deltaT);
  }

  getMaxAlpha() {
    const maxDensity = 1 / (8 * this.rZero * this.rZero * this.rZero);
    return 1 - Math.exp(-Math.PI * this.rZero * this.rZero * maxDensity * this.deltaT);
  }

  getMaxValue () {
    return _.chain(this.kvsml).map(k => k.maxValue).max().value();
  }

  getMinValue () {
    return _.chain(this.kvsml).map(k => k.minValue).min().value();
  }

  getNumberOfVertices () {
    return this.numberOfParticles;
  }

  getFramesPerSecond () {
    return this.stats.domElement.innerText.split(' ')[0];
  }

  getDomElement () {
    return this.renderer.domElement;
  }

  setVertexCoords (coords, idx) {
    this.kvsml[idx].numberOfVertices = coords.length / 3;
    this.geometry[idx].addAttribute('position', new THREE.BufferAttribute(coords, 3));
  }

  setVertexValues (values, idx) {
    this.kvsml[idx].maxValue = _.max(values);
    this.kvsml[idx].minValue = _.min(values);
    this.material[idx].uniforms.maxValue.value = _.max(values);
    this.material[idx].uniforms.minValue.value = _.min(values);
    this.geometry[idx].addAttribute('valueData', new THREE.BufferAttribute(values, 1));
  }

  generateParticlesFromPrism(coords, values, connect, params) {
    const numberOfParticlesArray = new Array(Math.floor(connect.length / 6));
    let numberOfParticles = 0;

    //  create a prism cell and count the number of particles in each cell
    for(let i = 0, cellNumber = 0; i < connect.length - 5; i = i + 6) {
      const v = _.range(6).map(j => this.getCoord(coords, connect[i + j]));
      const prism = new prismCell(...v);

      //  calculate the number of particles in the prism.
      const nParticleFloat = this.getBaseDencity() * prism.calculateVolume();
      let nParticle = Math.floor(nParticleFloat);
      if (nParticleFloat - nParticle > Math.random()) nParticle++;
      numberOfParticles += nParticle;
      numberOfParticlesArray[cellNumber++] = nParticle;
    }

    //  generate particles
    this.scene.forEach((element, idx) => {
      const particleCoords = new Float32Array(numberOfParticles * 3);
      const particleValues = new Float32Array(numberOfParticles);

      let valueIndex = 0;
      let coordIndex = 0;
      //  create a prism cell and generate particles
      for(let i = 0, cellNumber = 0; i < connect.length - 5; i = i + 6) {
        const v = _.range(6).map(j => this.getCoord(coords, connect[i + j]));
        const s = _.range(6).map(j => values[connect[i + 0]]);

        const prism = new prismCell(...v);
        prism.setVertexScalar(...s);

        //  generate particles
        for(let j = 0; j < numberOfParticlesArray[cellNumber]; j++){
          const sample = prism.randomSampling();
          particleValues[valueIndex] = prism.interpolateScalar(sample);
          valueIndex++;

          const global_coords = prism.localToGlobal(sample);
          _.times(3, i => {
            particleCoords[coordIndex] = global_coords[i];
            coordIndex++;
          });
        }
        cellNumber++;
      }
      this.setVertexCoords(particleCoords, idx);
      this.setVertexValues(particleValues, idx);
      this.scene[idx].add(this.points[idx]);
      this.updateTransferFunction(params, idx);
    });

    this.numberOfParticles = numberOfParticles;
    this.updateAllMaxMinValue();
  }

  getCoord(data, idx) {
    return [data[idx * 3], data[idx * 3 + 1], data[idx * 3 + 2]];
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

  updateTransferFunction(params, idx){
    const opacityTexture = this.getTransferFunctionOpacity(params.opacity);
    const colorTexture = this.getTransferFunctionColor(params.spectrum);
    this.material[idx].uniforms.transferFunctionOpacity.value = opacityTexture;
    this.material[idx].uniforms.transferFunctionColor.value = colorTexture;
  }

  updateAllTransferFunction(params){
    const opacityTexture = this.getTransferFunctionOpacity(params.opacity);
    const colorTexture = this.getTransferFunctionColor(params.spectrum);
    this.scene.forEach((element,idx) => {
      this.material[idx].uniforms.transferFunctionOpacity.value = opacityTexture;
      this.material[idx].uniforms.transferFunctionColor.value = colorTexture;
    });
  }

  updateAllMaxMinValue(){
    const max = this.getMaxValue();
    const min = this.getMinValue();
    this.scene.forEach((element, idx) => {
      this.material[idx].uniforms.maxValue.value = max;
      this.material[idx].uniforms.minValue.value = min;
    });
  }

}
