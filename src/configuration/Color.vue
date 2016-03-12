<template lang="jade">
.title Color palette
.row
  .column.column-80
    canvas#palette(@mousemove="pickColor" @mousedown="pickColor" width="350" height="128")
  .column.column-20
    .block(v-bind:style="{background: currentColor}")
    .rgb= "{{{ rgb }}}"

.title Color
canvas#color(@mousemove="updateColor" @mousedown="updateColor" width="430" height="40")
</template>

<script>
import _ from 'lodash';
import tinycolor from 'tinycolor2';

export default {
  data () {
    return {
      colorsData: [],
      currentColor: '#ff0000'
    }
  },
  computed: {
    palette: () => document.querySelector('#palette'),
    color: () => document.querySelector('#color'),
    rgb () {
      const rgb = tinycolor(this.currentColor).toRgb();
      return `R: ${rgb['r']}<br>G: ${rgb['g']}<br>B: ${rgb['b']}`;
    }
  },
  ready () {
    this.initPalette();
    this.initColor();

    this.$on('reset', () => {
      this.initPalette();
      this.initColor();
    });
  },
  methods: {
    initPalette () {
      this.currentColor = '#ff0000';
      const context = this.palette.getContext('2d');
      const img = new Image();
      img.src = './assets/img/palette.png';
      img.onload = () => {
        context.drawImage(img, 0, 0);
        this.colorsData = context.getImageData(0, 0, this.palette.width, this.palette.height).data;
      }
    },
    initColor () {
      const context = this.color.getContext('2d');
      context.rect(0, 0, this.color.width, this.color.height);
      const grd = context.createLinearGradient(0, this.color.height/2, this.color.width, this.color.height/2);
      _.forEach(['#0000ff', '#00ffff', '#00ff00', '#ffff00', '#ff0000'], (el, idx) => grd.addColorStop(0.25 * idx, el));
      context.fillStyle = grd;
      context.fill();
    },
    pickColor (e) {
      if(e.buttons === 0) return;
      const idx = Math.round(e.layerY * 350 + e.layerX) * 4;
      const hexR = `00${this.colorsData[idx+0].toString(16)}`.substr(-2),
            hexG = `00${this.colorsData[idx+1].toString(16)}`.substr(-2),
            hexB = `00${this.colorsData[idx+2].toString(16)}`.substr(-2);
      this.currentColor = '#' + hexR + hexG + hexB;
    },
    updateColor (e) {
      if(e.buttons === 0) return;
      const context = this.color.getContext('2d');
      context.lineWidth = 5;
      context.strokeStyle = tinycolor(this.currentColor).setAlpha(0.7);
      context.beginPath();
      context.moveTo(e.layerX, 0)
      context.lineTo(e.layerX, 40);
      context.stroke();
      context.closePath();
    }
  }
};
</script>

<style scoped>
#palette {
  cursor: crosshair;
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
