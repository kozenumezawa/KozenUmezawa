<template lang="jade">
.title Particle size (WIP)
canvas#radius(@mousemove="updateRadius" @mousedown="updateRadius" width="430" height="60")
</template>

<script>
import helper from '../helper';

export default {
  computed: {
    radius: () => document.getElementById('radius')
  },
  data () {
    return {
      radiusArray: null
    }
  },
  ready () {
    this.initRadius();
    this.fillGradient();
    this.drawLevelLine();
    this.applyRadius();

    this.$on('reset', () => {
      this.initRadius();
      this.fillGradient();
      this.drawLevelLine();
      this.applyRadius();
    });
  },
  methods: {
    initRadius () {
      this.radiusArray = Array(100).fill(null);
    },
    fillGradient () {
      const ctx = this.radius.getContext('2d');
      const grd = ctx.createLinearGradient(0, 0, this.radius.width, 0);
      ctx.clearRect(0, 0, this.radius.width, this.radius.height);
      _.each(this.radiusArray, (c, idx) => {
        if(!c) return grd.addColorStop(idx / this.radius.width, 'rgba(40,40,40,255)');
        grd.addColorStop(idx / this.radius.width, `rgba(${c},${c},${c},255)`);
      });
      ctx.fillStyle = grd;
      ctx.rect(0, 0, this.radius.width, this.radius.height);
      ctx.fill();
    },
    updateRadius (e) {
      if(e.buttons === 0) return;
      const ctx = this.radius.getContext('2d');
      const clickedPoint = helper.getClickedPoint(e);
      this.radiusArray[Math.floor(clickedPoint.offsetX)] = Math.floor(clickedPoint.offsetY / 60 * 255);
      this.fillGradient();
      this.applyRadius();
    },
    applyRadius () {
      const dump = this.radius.getContext('2d').getImageData(0, 0, this.radius.width, 1).data;
      _.times(this.radius.width, i => this.$parent.radius[i] = dump[i*4] / 255);
    }
  }
};
</script>

<style scoped>
#radius {
  width: 430px;
  height: 60px;
  border: 1px solid #aaa;
}
</style>
