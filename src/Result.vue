<template lang="jade">
#result
</template>

<script>
import _ from 'lodash';
import request from 'axios';

import shader from './shader';

const colorArray = (values, spectrum) => {
  const max = _.max(values);
  const min = _.min(values);
  return _.map(values, v => new THREE.Color(spectrum[Math.floor((v-min)/max*100)]));
};

const kvsml = {
  normal: null,
  coord: null,
  value: null
}

let camera, scene, renderer, controls, particles, material;

export default {
  ready () {
    this.init();
    this.animate();

    this.$on('apply', () => {
      this.updateVertexColors();
    });

    this.$on('reset', () => {
      this.updateVertexCoords();
      this.updateVertexColors();
    });
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

      particles = new THREE.Geometry();

      material = new THREE.PointsMaterial({size: 0.1, vertexColors: THREE.VertexColors});

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
    retrieveSampleKvsml () { // XXX: This block should be replaced with OPeNDAP request.
      request.get('./assets/kvsml/test_coord.dat',  {responseType: 'arraybuffer'})
      .then(res => {
        kvsml.coord = res.data;
        this.updateVertexCoords();
      })
      .then(() => request.get('./assets/kvsml/test_value.dat', {responseType: 'arraybuffer'}))
      .then(res => {
        kvsml.value = res.data;
        this.updateVertexColors();
      })
      .then(() => scene.add(new THREE.Points(particles, material)))
      .catch(console.error);
    },
    updateVertexColors () {
      particles.colorsNeedUpdate = true;
      particles.colors = colorArray(new Float32Array(kvsml.value), this.$parent.spectrum);
    },
    updateVertexCoords () { // TODO: terrible performance, should be truncate data?
      const coord = new Float32Array(kvsml.coord);
      _.times(coord.length/3, i => {
        return particles.vertices.push(new THREE.Vector3(coord[i*3], coord[i*3+1], coord[i*3+2]));
      });
    }
  }
}
</script>
