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

import vdap from 'vdap'
import PBVRenderer from '../PBVRenderer';

const pbvr = new PBVRenderer(640, 640);

export default {
  ready () {
    this.$on('updateVertexColors', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateAllVertexColors(this.$parent.spectrum);
      }
    });

    this.$on('updateOpacity', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateAllOpacity(this.$parent.opacity);
      }
    });

    this.$on('updateOpacityParams', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateAllOpacityParams(this.$parent.alphaZero, this.$parent.rZero);
      }
    });

    this.$on('apply', () => pbvr.updateAllParticles(this.$parent));
    this.$on('reset', () => pbvr.updateAllParticles(this.$parent));

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
    retrieveSampleKvsml () {
      vdap.loadData('./assets/test.nc.dods')
        .then((data) => {
          pbvr.setRandomVertex(data[0], data[1], data[2], data[3], this.$parent)
          this.updateStats()
        })
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
