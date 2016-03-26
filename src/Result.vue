<template lang="jade">
.title Result
#result
.row
  .column.column-50
    //- | Number of vertices: <b>{{ numberOfVertices }}</b><br>
    //- | Frames per second: <b>{{ framePerSecond }}</b>
  .column.column-50
    //- | Maximum value: <b>{{ Math.floor(maxValue * 100) / 100 }}</b><br>
    //- | Minimum value: <b>{{ Math.floor(minValue * 100) / 100 }}</b>
</template>

<script>
import _ from 'lodash';

import THREE from 'three';
import Stats from 'stats.js';
const OrbitControls = require('three-orbit-controls')(THREE);

import request from 'axios';
request.defaults.responseType = 'arraybuffer';

import shader from './shader';

const kvsml = {normal: [], coord: [], value: []};
let camera, scene, renderer, controls, geometry, material, points, stats;

export default {
  ready () {
    this.init();
    this.animate();

    this.$on('render', () => {
      this.updateVertexColors();
      this.updateVertexRadius();
      this.updateOpacityParams();
    });
  },
  computed: {
    el: () => document.getElementById('result'),
    maxValue: () => _.max(kvsml.value),
    minValue: () => _.min(kvsml.value),
    numberOfVertices: () => kvsml.coord.length / 3,
  },
  methods: {
    init () {
      stats = new Stats();

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, 1, 1, 1000);
      camera.position.x = 80;

      renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(this.el.offsetWidth, this.el.offsetWidth);

      controls = new OrbitControls(camera, renderer.domElement);

      geometry = new THREE.BufferGeometry();

      material = new THREE.ShaderMaterial(_.assign(THREE.ShaderLib['points'], {
        uniforms: {
          alphaZero: {type: 'f', value: this.$parent.alphaZero},
          rZero: {type: 'f', value: this.$parent.rZero}
        },
        blending: THREE.AdditiveBlending,
        vertexColors: THREE.VertexColors,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
      }));

      points = new THREE.Points(geometry, material);

      this.retrieveSampleKvsml();

      this.el.appendChild(renderer.domElement);
    },
    animate () {
      requestAnimationFrame(this.animate);
      controls.update();
      stats.update();
      this.render();
    },
    render () {
      renderer.render(scene, camera);
    },
    retrieveSampleKvsml () { // TODO: This block should be replaced with OPeNDAP request.
      request.get('./assets/kvsml/test_coord.dat')
      .then(res => {
        kvsml.coord = new Float32Array(res.data).slice(0, 90000); // truncate for development
        this.updateVertexCoords();
      })
      .then(() => request.get('./assets/kvsml/test_value.dat'))
      .then(res => {
        kvsml.value = new Float32Array(res.data).slice(0, 30000); // truncate for development
        this.updateVertexColors();
        this.updateVertexRadius();
      })
      .then(() => scene.add(points))
      .catch(console.error);
    },
    updateVertexCoords () {
      geometry.addAttribute('position', new THREE.BufferAttribute(kvsml.coord, 3));
    },
    updateVertexColors () {
      const colors = new Float32Array(_.flatMap(kvsml.value, v => {
        return this.$parent.spectrum[Math.floor((v - this.minValue) / this.maxValue * 100)];
      }));
      geometry.addAttribute('color', new THREE.BufferAttribute(colors, 4));
    },
    updateVertexRadius () {
      const radiuses = new Float32Array(_.map(kvsml.value, v => {
        const idx = Math.floor(this.$parent.radius.length * (v - this.minValue) / this.maxValue);
        return this.$parent.radius[idx];
      }));
      if(_.compact(radiuses).length === 0) return;
      geometry.addAttribute('radius', new THREE.BufferAttribute(radiuses, 1));
    },
    updateOpacityParams () {
      material.uniforms.alphaZero.value = this.$parent.alphaZero;
      material.uniforms.rZero.value = this.$parent.rZero;
    }
  }
}
</script>
