<template lang="jade">
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
import request from 'axios';
request.defaults.responseType = 'arraybuffer';

import PBVRenderer from '../PBVRenderer';

const pbvr = new PBVRenderer(640, 640);

export default {
  ready () {
    this.$on('updateVertexColors', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateVertexColors(this.$parent.spectrum);
      }
    });

    this.$on('updateOpacity', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateOpacity(this.$parent.opacity);
      }
    });

    this.$on('updateOpacityParams', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateOpacityParams(this.$parent.alphaZero, this.$parent.rZero);
      }
    });

    this.$on('apply', () => pbvr.updateAllAttributes(this.$parent));
    this.$on('reset', () => pbvr.updateAllAttributes(this.$parent));

    document.getElementById('result').appendChild(pbvr.getDomElement());

    this.retrieveSampleKvsml();

    pbvr.animate();
  },
  data () {
    return {
      minValue: 0,
      maxValue: 0,
      framesPerSecond: 0,
      numberOfVertices: 0,
    }
  },
  methods: {
    retrieveSampleKvsml () { // TODO: This block should be replaced with OPeNDAP request if needed.
      var coords, values;
      request.get('./assets/kvsml/test_coord.dat')
      .then(res => coords = res.data)
      .then(() => request.get('./assets/kvsml/test_value.dat'))
      .then(res => values = res.data)
      .then(() => { pbvr.setRandomVertex(new Float32Array(coords), new Float32Array(values), this.$parent)})
      .then(this.updateStats);
    },
    updateStats () {
      this.minValue = Math.floor(pbvr.getMinValue() * 100) / 100;
      this.maxValue = Math.floor(pbvr.getMaxValue() * 100) / 100;
      this.numberOfVertices = pbvr.getNumberOfVertices();

      setInterval(() => {
        this.framesPerSecond = pbvr.getFramesPerSecond();
      }, 1000);
    }
  }
}
</script>
