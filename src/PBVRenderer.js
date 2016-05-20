import _ from 'lodash';

import THREE from 'three';
import Stats from 'stats.js';
const OrbitControls = require('three-orbit-controls')(THREE);

import shader from './shader';

export default class PBVRenderer {
  constructor (width, height) {
    this.animate = this.animate.bind(this);

    this.renderer = new THREE.WebGLRenderer({antialias: true});
    this.renderer.setPixelRatio(window.devicePixelRatio ? window.devicePixelRatio : 1);
    this.renderer.setSize(width, height);

    this.stats = new Stats();

    this.scene = new THREE.Scene();

    this.camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
    this.camera.position.x = 80;

    this.geometry = new THREE.BufferGeometry();

    this.material = new THREE.ShaderMaterial(_.assign(THREE.ShaderLib['points'], {
      uniforms: {
        alphaZero: {type: 'f', value: 0.3},
        rZero: {type: 'f', value: 0.9}
      },
      vertexColors: THREE.VertexColors,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader
    }));

    this.points = new THREE.Points(this.geometry, this.material);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);

    this.kvsml = {values: [], maxValue: 0, minValue: 1, numberOfVertices: 0};
  }

  animate () {
    requestAnimationFrame(this.animate);
    this.controls.update();
    this.stats.update();
    this.renderer.render(this.scene, this.camera);
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

  setVertexCoords (coords) {
    this.kvsml.numberOfVertices = coords.length / 3;
    this.geometry.addAttribute('position', new THREE.BufferAttribute(coords, 3));
  }

  setVertexValues (values) {
    this.kvsml.maxValue = _.max(values);
    this.kvsml.minValue = _.min(values);
    this.kvsml.values = values;
  }

  chooseSetVertex(coords, values){
    this.setVertexCoords(new Float32Array(coords));
    this.setVertexValues(new Float32Array(values));
  }

  addPointsToScene () {
    this.scene.add(this.points);
  }

  updateVertexColors (spectrum) {
    const range = spectrum.length - 1;
    const colors = new Float32Array(_.flatMap(this.kvsml.values, v => {
      const idx = Math.floor(range * (v - this.kvsml.minValue) / (this.kvsml.maxValue - this.kvsml.minValue));
      return spectrum[idx];
    }));
    this.geometry.addAttribute('color', new THREE.BufferAttribute(colors, 4));
  }

  updateOpacity (opacity) {
    const range = opacity.length - 1;
    const opacities = new Float32Array(_.map(this.kvsml.values, v => {
      const idx = Math.floor(range * (v - this.kvsml.minValue) / (this.kvsml.maxValue - this.kvsml.minValue));
      return opacity[idx];
    }));
    this.geometry.addAttribute('alpha', new THREE.BufferAttribute(opacities, 1));
  }

  updateOpacityParams (alphaZero, rZero) {
    this.material.uniforms.alphaZero.value = alphaZero;
    this.material.uniforms.rZero.value = rZero;
  }

  updateAllAttriutes (params) {
    this.updateVertexColors(params.spectrum);
    this.updateOpacity(params.opacity);
    this.updateOpacityParams(params.alphaZero, params.rZero);
  }
}
