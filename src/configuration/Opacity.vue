<template lang="jade">
.title Opacity
canvas#opacity(@mousemove="updateOpacity" @mousedown="updateOpacity" width="430" height="60")
</template>

<script>
export default {
  computed: {
    opacity: () => document.querySelector('#opacity')
  },
  ready () {
    this.init();

    this.$on('reset', () => {
      this.init();
    });
  },
  methods: {
    init () {
      const ctx = this.opacity.getContext('2d');
      ctx.clearRect(0, 0, this.opacity.width, this.opacity.height);
      ctx.rect(0, 0, this.opacity.width, this.opacity.height);
      const grd = ctx.createLinearGradient(0, this.opacity.height/2, this.opacity.width, this.opacity.height/2);
      grd.addColorStop(0, 'rgba(255,255,255,0)');
      grd.addColorStop(1, 'rgba(0, 0, 0, 1)');
      ctx.fillStyle = grd;
      ctx.fill();
    },
    updateOpacity (e) {
      if(e.buttons === 0) return;
      const ctx = this.opacity.getContext('2d');
      ctx.lineWidth = 5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)'
      ctx.beginPath();
      ctx.moveTo(e.layerX, 0)
      ctx.lineTo(e.layerX, 60);
      ctx.stroke();
      ctx.closePath();
    }
  }
};
</script>

<style scoped>
#opacity {
  background: url(data:image/gif;base64,R0lGODlhEAAQAPEBAAAAAL+/v////wAAACH5BAAAAAAALAAAAAAQABAAAAIfjG+iq4jM3IFLJipswNly/XkcBpIiVaInlLJr9FZWAQA7);
}
</style>
