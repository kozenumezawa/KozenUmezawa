<template lang="pug">
.title Result
#result
.row
  .column.column-50
    | Number of vertices: <b>{{ numberOfVertices }}</b><br>
    | Frames per second: <b>{{ framesPerSecond }}</b>
  .column.column-50
    | Maximum value: <b>{{ maxValue }}</b><br>
    | Minimum value: <b>{{ minValue }}</b>
</template>

<script>
import axios from 'axios';
axios.defaults.responseType = 'arraybuffer';

import PBVRenderer from '../PBVRenderer';

const pbvr = new PBVRenderer(640, 640);

export default {
  ready () {
    this.$on('updateTransferFunction', () => pbvr.updateTransferFunction(this.$parent));
    document.getElementById('result').appendChild(pbvr.renderer.domElement);
    this.retrieveSampleKvsml();
  },
  data () {
    return {
      minValue: '-',
      maxValue: '-',
      framesPerSecond: 0,
      numberOfVertices: 0
    };
  },
  methods: {
    retrieveSampleKvsml () {
      Promise.all([
        axios.get('./assets/kvsml/51000_coord.dat'),
        axios.get('./assets/kvsml/51000_value.dat'),
        axios.get('./assets/kvsml/51000_connect.dat')
      ])
      .then(res => {
        const coords = new Float32Array(res[0].data);
        const values = new Float32Array(res[1].data);
        const connects = new Uint32Array(res[2].data);
        this.numberOfVertices = values.length;
        pbvr.generateParticlesFromPrism(coords, values, connects, this.$parent);
        pbvr.animate();
      })
      .then(this.updateStats);
    },
    updateStats () {
      this.minValue = Math.floor(pbvr.minValue * 100) / 100;
      this.maxValue = Math.floor(pbvr.maxValue * 100) / 100;
      this.$parent.minValue = this.minValue;
      this.$parent.maxValue = this.maxValue;
      setInterval(() => {
        this.framesPerSecond = pbvr.getFramesPerSecond();
      }, 1000);
    }
  }
};
</script>
