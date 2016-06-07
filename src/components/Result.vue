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
        pbvr.updateAllTransferFunction(this.$parent);
      }
    });

    this.$on('updateOpacity', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateAllTransferFunction(this.$parent);
      }
    });

    this.$on('updateOpacityParams', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateAllOpacityParams(this.$parent.alphaZero, this.$parent.rZero);
      }
    });

    this.$on('updateEnsembleN', () => {
      if(this.$parent.applyImmediately){
        pbvr.updateEnsembleN(this.$parent.ensembleN);
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
      minValue: '-',
      maxValue: '-',
      framesPerSecond: 0,
      numberOfVertices: 0,
    }
  },
  methods: {
    retrieveSampleKvsml () {
      const key = 'dods-password'
      const password = localStorage.getItem(key) || prompt('password?')
      const hash = btoa(`vizlab:${password}`)
      vdap.loadData('http://133.3.250.177/thredds/dodsC/pbr/test.nc.dods?x,y,z,value', {headers: {Authorization: `Basic ${hash}`}})
        .then((data) => {
          localStorage.setItem(key, password)
          pbvr.setRandomVertex(data[0], data[1], data[2], data[3], this.$parent)
          this.updateStats()
        })
        .catch(() => {
          localStorage.removeItem(key)
        })
    },
    updateStats () {
      this.minValue = Math.floor(pbvr.getMinValue() * 100) / 100;
      this.maxValue = Math.floor(pbvr.getMaxValue() * 100) / 100;
      this.$parent.minValue = this.minValue;
      this.$parent.maxValue = this.maxValue;
      this.numberOfVertices = pbvr.getNumberOfVertices();
      this.$parent.emit('updateValue');
      setInterval(() => {
        this.framesPerSecond = pbvr.getFramesPerSecond();
      }, 1000);
    }
  }
}
</script>
