<template lang="jade">
#result
</template>

<script>
import _ from 'lodash';
import request from 'axios';
request.defaults.responseType = 'arraybuffer';

import shader from './shader';

const kvsml = {
  normal: null,
  coord: null,
  value: null
}

let camera, scene, renderer, controls, geometry, material, points;

export default {
  ready () {
    this.init();
    this.animate();

    this.$on('apply', () => {
      this.updateVertexColors();
      this.updateVertexRadius();
    });

    this.$on('reset', () => {
      this.updateVertexColors();
      this.updateVertexRadius();
    });
  },
  computed: {
    maxValue: () => _.max(kvsml.value),
    minValue: () => _.min(kvsml.value),
    numberOfVertices: () => kvsml.coord.length / 3
  },
  methods: {
    init () {
      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(45, 1/0.8, 1, 1000);
      camera.position.x = 80;

      renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(this.$el.offsetWidth, this.$el.offsetWidth * 0.8);

      geometry = new THREE.BufferGeometry();

      material = new THREE.ShaderMaterial(_.assign(THREE.ShaderLib['points'], {
    		uniforms: THREE.UniformsLib[ "points" ],
        blending: THREE.AdditiveBlending,
        vertexColors: THREE.VertexColors,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader
      }));

      points = new THREE.Points(geometry, material);

      controls = new THREE.OrbitControls(camera, renderer.domElement);

      this.retrieveSampleKvsml();

      this.$el.appendChild(renderer.domElement);
    },
    animate () {
      requestAnimationFrame(this.animate);
      controls.update();
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
        return this.$parent.radius[Math.floor((v - this.minValue) / this.maxValue * 100)];
      }));
      geometry.addAttribute('radius', new THREE.BufferAttribute(radiuses, 1));
    }
  }
}
</script>
