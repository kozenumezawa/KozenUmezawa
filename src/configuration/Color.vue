<template lang="jade">
.title Color palette
.row
  .column.column-80
    canvas#palette(@mousemove="pickColor" @mousedown="pickColor" width="350" height="128")
  .column.column-20
    .block(v-bind:style="{background: currentColor}")
    .rgb= "{{{ rgb }}}"

.title Color
canvas#color(width="400" height="40")
</template>

<script>
import _ from 'lodash';
import tinycolor from 'tinycolor2';

export default {
  data () {
    return {
      colorData: null,
      currentColor: '#ffffff'
    }
  },
  computed: {
    palette () {
      return document.querySelector('#palette');
    },
    color () {
      return document.querySelector('#color');
    },
    rgb () {
      const rgb = tinycolor(this.currentColor).toRgb();
      return `R: ${rgb['r']}<br>G: ${rgb['g']}<br>B: ${rgb['b']}`;
    }
  },
  ready () {
    this.initPalette();
    this.initColor();
  },
  methods: {
    initPalette () {
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
      grd.addColorStop(0.00, '#0000ff');
      grd.addColorStop(0.25, '#00ffff');
      grd.addColorStop(0.50, '#00ff00');
      grd.addColorStop(0.75, '#ffff00');
      grd.addColorStop(1.00, '#ff0000');
      context.fillStyle = grd;
      context.fill();
    },
    pickColor: function(e){
      if(e.buttons === 0) return;
      const idx = Math.round(e.layerY * 350 + e.layerX) * 4;
      const hexR = `00${this.colorsData[idx+0].toString(16)}`.substr(-2),
            hexG = `00${this.colorsData[idx+1].toString(16)}`.substr(-2),
            hexB = `00${this.colorsData[idx+2].toString(16)}`.substr(-2);
      this.currentColor = '#' + hexR + hexG + hexB;
    }
  }
};
</script>

<style scoped>
#palette {
  cursor: crosshair;
}
#color {
  width: 100%
}
.current-color {
  width: 60px;
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
