<template lang="jade">
.title Color palette
.row
  .column.column-80
    canvas#palette(@mousemove="pickColor" @mousedown="pickColor" width="350" height="128")
  .column.column-20
    .block(v-bind:style="{background: currentColor}")
    .rgb= "{{{ rgb }}}"

.title Spectrum
canvas#spectrum(@mousemove="updateSpectrum" @mousedown="updateSpectrum" width="430" height="1")
</template>

<script>
import _ from 'lodash';
import tinycolor from 'tinycolor2';

export default {
  data () {
    return {
      imgData: [],
      currentColor: '#ff0000'
    }
  },
  computed: {
    palette: () => document.querySelector('#palette'),
    spectrum: () => document.querySelector('#spectrum'),
    rgb () {
      const rgb = tinycolor(this.currentColor).toRgb();
      return `R: ${rgb['r']}<br>G: ${rgb['g']}<br>B: ${rgb['b']}`;
    }
  },
  ready () {
    this.initPalette();
    this.initSpectrum();

    this.$on('reset', () => {
      this.initPalette();
      this.initSpectrum();
    });
  },
  methods: {
    initPalette () {
      this.currentColor = '#ff0000';
      const ctx = this.palette.getContext('2d');
      const img = new Image();
      img.src = './assets/img/palette.png';
      img.onload = () => {
        ctx.drawImage(img, 0, 0);
        this.imgData = ctx.getImageData(0, 0, this.palette.width, this.palette.height).data;
      }
    },
    initSpectrum () {
      const ctx = this.spectrum.getContext('2d');
      ctx.rect(0, 0, this.spectrum.width, this.spectrum.height);
      const grd = ctx.createLinearGradient(0, this.spectrum.height/2, this.spectrum.width, this.spectrum.height/2);
      _.forEach(['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'], (el, idx) => grd.addColorStop(0.25 * idx, el));
      ctx.fillStyle = grd;
      ctx.fill();
    },
    pickColor (e) {
      if(e.buttons === 0) return;
      const idx = Math.round(e.layerY * 350 + e.layerX) * 4;
      this.currentColor = `rgb(${this.imgData[idx]},${this.imgData[idx+1]},${this.imgData[idx+2]})`;
    },
    updateSpectrum (e) {
      if(e.buttons === 0) return;
      const ctx = this.spectrum.getContext('2d');
      ctx.lineWidth = 5;
      ctx.strokeStyle = tinycolor(this.currentColor).setAlpha(0.7);
      ctx.beginPath();
      ctx.moveTo(e.layerX, 0)
      ctx.lineTo(e.layerX, 1);
      ctx.stroke();
      ctx.closePath();
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
.rgb {
  font-family: monospace;
  font-size: 15px;
}
.block {
  display: inline-block;
  width: 60px;
  height: 50px;
}
</style>
