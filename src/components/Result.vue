<template lang="pug">
.title Result
#result
.row
  .column.column-50
    | Number of cells: <b>{{ numberOfVertices }}</b><br>
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
const rcBuffer = new Uint8Array(640 * 640 * 4);
const pbvrBuffer = new Uint8Array(640 * 640 * 4);
const diffBuffer = new Uint8Array(640 * 640 * 4);
let diffAmount = 0;

export default {
  ready () {
    this.$on('updateTransferFunction', () => pbvr.updateTransferFunction());
    document.getElementById('result').appendChild(pbvr.renderer.domElement);
    setInterval(() => this.checkDiff(), 500);
    this.retrieveLobstarData();
  },
  data () {
    return {
      minValue: '-',
      maxValue: '-',
      framesPerSecond: 0,
      numberOfVertices: 0,
    };
  },
  methods: {
    retrieveLobstarData() {
      axios.get('./assets/kvsml/lobstar_value.dat')
      .then(res => {
        const values = new Float32Array(res.data);
        this.numberOfVertices = values.length;
        pbvr.generateParticlesFromCubes(values);
        pbvr.animate();
      })
      .then(this.updateStats);
    },
    updateStats () {
      this.minValue = Math.floor(pbvr.minValue * 100) / 100;
      this.maxValue = Math.floor(pbvr.maxValue * 100) / 100;
      this.$parent.minValue = this.minValue;
      this.$parent.maxValue = this.maxValue;
    },
    checkDiff() {
      const rcCtx = document.getElementById('ray-casting').contentWindow.ctx;
      if(!rcCtx) return;
      rcCtx.readPixels(0, 0, 640, 640, rcCtx.RGBA, rcCtx.UNSIGNED_BYTE, rcBuffer);
      if(rcBuffer.every(e => e == 0 || e == 255)) return; // somehow rcCtx returns empty array

      const pbvrCtx = pbvr.renderer.domElement.getContext('webgl', {preserveDrawingBuffer: true});
      pbvrCtx.readPixels(0, 0, 640, 640, pbvrCtx.RGBA, pbvrCtx.UNSIGNED_BYTE, pbvrBuffer);

      for(let i=0; i<diffBuffer.length; i+=4) {
        diffBuffer[i + 0] = Math.abs(pbvrBuffer[i + 0] - rcBuffer[i + 0]);
        diffBuffer[i + 1] = Math.abs(pbvrBuffer[i + 1] - rcBuffer[i + 1]);
        diffBuffer[i + 2] = Math.abs(pbvrBuffer[i + 2] - rcBuffer[i + 2]);
        diffBuffer[i + 3] = 255;
      }
      const diffImageData = document.createElement('canvas').getContext('2d').createImageData(640, 640);
      diffImageData.data.set(diffBuffer);
      document.getElementById('diff-image').getContext('2d').putImageData(diffImageData, 0, 0);
      const tmp = diffBuffer.reduce((a, b) => a + b) - 255 * 640 * 640;
      if(diffAmount === tmp) return;
      diffAmount = tmp;
      console.log(`${tmp} diff: `);
    }
  }
};
</script>
