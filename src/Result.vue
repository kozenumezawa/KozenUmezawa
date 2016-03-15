<template lang="jade">
#result
</template>

<script>
import _ from 'lodash';
import request from 'axios';

import shader from './shader';

let camera, scene, renderer, controls;

export default {
  ready () {
    this.init();
    this.animate();
  },
  methods: {
    init () {
      THREE.ShaderLib['points'].fragmentShader = shader.fragmentShader;

      scene = new THREE.Scene();

      camera = new THREE.PerspectiveCamera(80, 1/0.8, 1, 1000);
      camera.position.z = 40;

      renderer = new THREE.WebGLRenderer({antialias: true});
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(this.$el.offsetWidth, this.$el.offsetWidth * 0.8);

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
    retrieveSampleKvsml () {
      const particles = new THREE.Geometry();
      const material = new THREE.PointsMaterial({
        size: 0.06,
        transparent: true,
        vertexColors: THREE.VertexColors
      });

      // This block should be replaced with OPeNDAP request.
      request.get('./assets/kvsml/test_coord.dat',  {responseType: 'arraybuffer'})
      .then(res => {
        const coord = new Float32Array(res.data);
        _.times(coord.length/3, i => {
          return particles.vertices.push(new THREE.Vector3(coord[i*3], coord[i*3+1], coord[i*3+2]));
        });
      })
      .then(() => request.get('./assets/kvsml/test_value.dat', {responseType: 'arraybuffer'}))
      .then(res => {
        const value = new Float32Array(res.data);
        const max = _.max(value);
        const min = _.min(value);
        particles.colors = _.map(value, v => {
          return (new THREE.Color()).setHSL((v-min) / max, 1.0, 0.5);
        });
      })
      .then(() => scene.add(new THREE.Points(particles, material)))
      .catch(console.error);
    }
  }
}
</script>
