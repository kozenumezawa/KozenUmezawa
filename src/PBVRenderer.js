import _ from 'lodash';

import THREE from 'three';
import Stats from 'stats.js';
const OrbitControls = require('three-orbit-controls')(THREE);

import shader from './shader';
import getEffectComposer from 'three-effectcomposer';
const EffectComposer = getEffectComposer(THREE);
import EnsembleAveragePass from 'three-ensemble-average-pass';

export default class PBVRenderer {
  constructor (width, height) {
    this.N_ENSEMBLE = 3;

    this.animate = this.animate.bind(this);

    this.renderer = new THREE.WebGLRenderer();
    const PixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    this.renderer.setPixelRatio(PixelRatio);
    this.renderer.setSize(width, height);

    this.stats = new Stats();

    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    this.camera.position.z = 70;

    //prepare points and scene with the same number of N_ENSEMBLE
    this.geometry = new Array();
    this.material = new Array();
    this.points = new Array();
    this.scene = new Array();
    for(var i=0; i<this.N_ENSEMBLE; i++){
      this.geometry.push(new THREE.BufferGeometry());
      this.material.push(new THREE.ShaderMaterial(_.assign(THREE.ShaderLib['points'], {
        uniforms: {
          alphaZero: {type: 'f', value: 0.3},
          rZero: {type: 'f', value: 0.9}
        },
        vertexColors: THREE.VertexColors,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
      })));
      this.points.push(new THREE.Points(this.geometry[i], this.material[i]));
      this.scene.push(new THREE.Scene());
    }

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.kvsml = {values: [], maxValue: 0, minValue: 1, numberOfVertices: 0};

    //Add EffectComposer to ralize a Postprocess
    this.composer = new EffectComposer(this.renderer, new THREE.WebGLRenderTarget(width*PixelRatio, height*PixelRatio, {
      magFilter: THREE.LinearFilter,
      minFilter: THREE.LinearFilter,
      wrapS: THREE.ClampToEdgeWrapping,
      warpT: THREE.ClampToEdgeWrapping,
      type: THREE.UnsignedByteType,
      format: THREE.RGBAFormat,
      anisotropy: this.renderer.getMaxAnisotropy(),
      stencilBuffer: false
    }));
    this.composer.addPass(new EffectComposer.ShaderPass({
      vertexShader: `
       void main() {
         gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
       }
      `,
      fragmentShader: `
        void main() {
          gl_FragColor = vec4(0.0, 0.0, 0.0, 0.0);
        }
      `
      }));
    this.scene.forEach((element,idx) => {
      const effect = new EnsembleAveragePass(this.scene[idx], this.camera, this.N_ENSEMBLE);
      if(idx == this.N_ENSEMBLE - 1)
        effect.renderToScreen = true;
      this.composer.addPass(effect);
    });
  }

  animate () {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.stats.update();
    this.composer.render();
  }

  getMaxValue () {
    return this.kvsml.maxValue;
  }

  getMinValue () {
    return this.kvsml.minValue;
  }

  getNumberOfVertices () {
    return this.kvsml.numberOfVertices;
  }

  getFramesPerSecond () {
    return this.stats.domElement.innerText.split(' ')[0];
  }

  getDomElement () {
    return this.renderer.domElement;
  }

  setVertexCoords (coords, idx) {
    this.kvsml.numberOfVertices = coords.length / 3;
    this.geometry[idx].addAttribute('position', new THREE.BufferAttribute(coords, 3));
  }

  setVertexValues (values) {
    this.kvsml.maxValue = _.max(values);
    this.kvsml.minValue = _.min(values);
    this.kvsml.values = values;
  }

  setRandomVertex(x, y, z, values, params){
    const N_particle = 500000;
    this.scene.forEach((element, idx) => {
      var index = new Array(N_particle);
      index.fill(0);

      index.forEach((element,id) => {
        index[id] = Math.floor(Math.random()*values.length);
      });
      index = index.sort((a,b) =>{return a-b});

      var tmpcoords = new Float32Array(N_particle*3);
      var tmpvalues = new Float32Array(N_particle);
      //Choose vertices at random
      index.forEach((element, id) => {
        tmpcoords[id * 3] = x[element]
        tmpcoords[id * 3 + 1] = y[element]
        tmpcoords[id * 3 + 2] = z[element]
        tmpvalues[id] = values[element]
      });

      this.setVertexCoords(tmpcoords, idx);
      this.setVertexValues(tmpvalues);
      this.addPointsToScene(idx);
      this.updateAllAttributes(params, idx);
    });
  }

  addPointsToScene (idx) {
    this.scene[idx].add(this.points[idx]);
  }

  updateVertexColors (spectrum, idx) {
    const range = spectrum.length - 1;
    var colors = new Float32Array(_.flatMap(this.kvsml.values, v => {
      const idx = Math.floor(range * (v - this.kvsml.minValue) / (this.kvsml.maxValue - this.kvsml.minValue));
      return spectrum[idx];
    }));

    this.geometry[idx].addAttribute('color', new THREE.BufferAttribute(colors, 4));
  }

  updateOpacity (opacity, idx) {
    const range = opacity.length - 1;
    const opacities = new Float32Array(_.map(this.kvsml.values, v => {
      const idx = Math.floor(range * (v - this.kvsml.minValue) / (this.kvsml.maxValue - this.kvsml.minValue));
      return opacity[idx];
    }));
    this.geometry[idx].addAttribute('alpha', new THREE.BufferAttribute(opacities, 1));
  }

  updateOpacityParams (alphaZero, rZero, idx) {
    this.material[idx].uniforms.alphaZero.value = alphaZero;
    this.material[idx].uniforms.rZero.value = rZero;
  }

  updateAllAttributes (params, idx) {
    this.updateVertexColors(params.spectrum, idx);
    this.updateOpacity(params.opacity, idx);
    this.updateOpacityParams(params.alphaZero, params.rZero, idx);
  }

  updateAllVertexColors (spectrum) {
    const range = spectrum.length - 1;
    this.scene.forEach((element, idx) => {
      var colors = new Float32Array(_.flatMap(this.kvsml.values, v => {
        const idx = Math.floor(range * (v - this.kvsml.minValue) / (this.kvsml.maxValue - this.kvsml.minValue));
        return spectrum[idx];
      }));
      this.geometry[idx].addAttribute('color', new THREE.BufferAttribute(colors, 4));
    });
  }

  updateAllOpacity (opacity, idx) {
    const range = opacity.length - 1;
    this.scene.forEach((element, idx) => {
      const opacities = new Float32Array(_.map(this.kvsml.values, v => {
        const idx = Math.floor(range * (v - this.kvsml.minValue) / (this.kvsml.maxValue - this.kvsml.minValue));
        return opacity[idx];
      }));
      this.geometry[idx].addAttribute('alpha', new THREE.BufferAttribute(opacities, 1));
    });
  }

  updateAllOpacityParams (alphaZero, rZero) {
    this.scene.forEach((element, idx) => {
      this.material[idx].uniforms.alphaZero.value = alphaZero;
      this.material[idx].uniforms.rZero.value = rZero;
    });
  }

  updateAllParticles (params) {
    this.updateAllVertexColors(params.spectrum);
    this.updateAllOpacity(params.opacity);
    this.updateAllOpacityParams(params.alphaZero, params.rZero);
  }
}
