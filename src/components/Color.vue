<template lang="jade">
.title Color palette
.row
  .column.column-80
    canvas#palette(@mousemove="pickColor" @mousedown="onMouseDown" @mouseup="onMouseUp"
                   @mouseleave="onMouseUp" width="350" height="128")
  .column.column-20
    .block(v-bind:style="{background: blockColor}")
    .rgb
      span!= "R: {{ currentColor[0] }}<br>"
      span!= "G: {{ currentColor[1] }}<br>"
      span!= "B: {{ currentColor[2] }}"

.title Spectrum
canvas#spectrum(@mousemove="updateSpectrum" @mousedown="onMouseDown" @mouseup="onMouseUp"
                @mouseleave="onMouseUp" width="100" height="1" debounce="500")
</template>

<script>
import _ from 'lodash';

import helper from '../helper';

let imgData = [];
let isDown = false;

export default {
  data () {
    return {
      currentColor: new Uint8ClampedArray([255, 0, 0])
    }
  },
  computed: {
    palette: () => document.querySelector('#palette'),
    spectrum: () => document.querySelector('#spectrum'),
    blockColor: function(){
      return `rgba(${_.join(this.currentColor, ',')}, 1.0)`;
    },
    rgb: function(){
      return _.join([
        `R: ${this.currentColor[0]}`,
        `G: ${this.currentColor[1]}`,
        `B: ${this.currentColor[2]}`
      ], '<br>');
    }
  },
  ready () {
    this.initPalette();
    this.initSpectrum();
    this.applySpectrum();

    this.$on('reset', () => {
      this.initPalette();
      this.initSpectrum();
      this.applySpectrum();
      this.$parent.emit('updateVertexColors');
    });
  },
  methods: {
    initPalette () {
      this.currentColor = new Uint8ClampedArray([255, 0, 0]);
      const ctx = this.palette.getContext('2d');
      const img = new Image();
      img.src = './assets/img/palette.png';
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        imgData = ctx.getImageData(0, 0, this.palette.width, this.palette.height).data;
      }
    },
    initSpectrum () {
      const ctx = this.spectrum.getContext('2d');
      ctx.rect(0, 0, this.spectrum.width, this.spectrum.height);
      const grd = ctx.createLinearGradient(0, 0, this.spectrum.width, 0);
      ['#0000ff','#00ffff','#00ff00','#ffff00','#ff0000'].forEach((v, i) => grd.addColorStop(i/4, v));
      ctx.fillStyle = grd;
      ctx.fill();
    },
    pickColor (e) {
      if(e.buttons === 0 || !isDown) return;
      const pos = helper.getClickedPoint(e);
      const i = Math.floor(pos.y * this.palette.width + pos.x) * 4;
      this.currentColor = imgData.slice(i, i + 3);
    },
    updateSpectrum (e) {
      if(e.buttons === 0 || !isDown) return;
      const ctx = this.spectrum.getContext('2d');
      const pos = helper.getClickedPoint(e);
      ctx.lineWidth = 3;
      ctx.strokeStyle = `rgba(${_.join(this.currentColor, ',')}, 0.7)`;
      ctx.beginPath();
      ctx.moveTo(pos.x / ctx.canvas.clientWidth * 100, 0)
      ctx.lineTo(pos.x / ctx.canvas.clientWidth * 100, 1);
      ctx.stroke();
      ctx.closePath();
      this.applySpectrum();
    },
    applySpectrum () {
      const dump = this.spectrum.getContext('2d').getImageData(0, 0, 100, 1).data;
      this.$parent.spectrum = _(dump).map(d => d/0xff).chunk(4).value();
    },
    onMouseDown () {
      isDown = true;
    },
    onMouseUp () {
      isDown = false;
      this.$parent.emit('updateVertexColors');
    }
  }
};
</script>

<style scoped>
#palette {
  cursor: crosshair;
}
#spectrum {
  height: 40px;
  width: 430px;
}
.block {
  display: inline-block;
  width: 50px;
  height: 36px;
  margin: 14px 0 0 10px;
}
.rgb {
  font-family: monospace;
  font-size: 13px;
  padding-left: 10px
}
</style>
