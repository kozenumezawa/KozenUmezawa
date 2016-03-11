<template lang="jade">
.row
  .column.column-80
    canvas#color-palette(v-on:mousemove="pickColor" width="350" height="200")
  .column.column-20
    .block(v-bind:style="{background: currentColor}")
    .rgb= "{{{ rgb }}}"
</template>

<script>
const tinycolor = require('tinycolor2');

export default {
  data () {
    return {
      colorData: null,
      currentColor: '#ffffff'
    }
  },
  computed: {
    canvas () {
      return document.querySelector('#color-palette');
    },
    rgb () {
      const rgb = tinycolor(this.currentColor).toRgb();
      return `R: ${rgb['r']}<br>G: ${rgb['g']}<br>B: ${rgb['b']}`;
    }
  },
  ready () {
    const context = this.canvas.getContext('2d');
    context.rect(0, 0, this.canvas.width, this.canvas.height);
    const arr = ['#FF0000','#FFFF00','#00FF00','#00FFFF','#0000FF','#FF00FF','#FF0000'];

    const grd1 = context.createLinearGradient(0, this.canvas.height, this.canvas.width, this.canvas.height);
    for(var c=0;c<arr.length;c++) grd1.addColorStop(Math.floor(100/6*c)/100,arr[c]);

    const grd2 = context.createLinearGradient(0, 0, 0, this.canvas.height/2);
    grd2.addColorStop(0, 'rgba(255,255,255,1)');
    grd2.addColorStop(1, 'rgba(255,255,255,0)');

    const grd3 = context.createLinearGradient(0, this.canvas.height/2, 0, this.canvas.height);
    grd3.addColorStop(0, 'rgba(0,0,0,0)');
    grd3.addColorStop(1, 'rgba(0,0,0,1)');

    context.fillStyle = grd1;
    context.fill();
    context.fillStyle = grd2;
    context.fill();
    context.fillStyle = grd3;
    context.fill();

    this.colorsData = context.getImageData(0, 0, this.canvas.width, this.canvas.height).data;
  },
  methods: {
    pickColor: function(e){
      const elPos = this.canvas.getBoundingClientRect();
      const pos = {left : e.pageX - elPos.left, top: e.pageY - elPos.top};
      const idx = Math.round(pos.top * 350 + pos.left) * 4;
      const hexR = ('00'+this.colorsData[idx+0].toString(16)).substr(-2),
            hexG = ('00'+this.colorsData[idx+1].toString(16)).substr(-2),
            hexB = ('00'+this.colorsData[idx+2].toString(16)).substr(-2);
      this.currentColor = '#' + hexR + hexG + hexB;
    }
  }
};
</script>

<style scoped>
#color-palette {
  display: inline-block;
  margin-right: 10px;
  vertical-align: top;
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
