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
      const context = this.opacity.getContext('2d');
      context.clearRect(0, 0, this.opacity.width, this.opacity.height);
      context.rect(0, 0, this.opacity.width, this.opacity.height);
      const grd = context.createLinearGradient(0, this.opacity.height/2, this.opacity.width, this.opacity.height/2);
      grd.addColorStop(0, 'rgba(255,255,255,0)');
      grd.addColorStop(1, 'rgba(0, 0, 0, 1)');
      context.fillStyle = grd;
      context.fill();
    },
    updateOpacity (e) {
      if(e.buttons === 0) return;
      const context = this.opacity.getContext('2d');
      context.lineWidth = 5;
      context.strokeStyle = 'rgba(0, 0, 0, 0.7)'
      context.beginPath();
      context.moveTo(e.layerX, 0)
      context.lineTo(e.layerX, 60);
      context.stroke();
      context.closePath();
    }
  }
};
</script>

<style scoped>
#opacity {
  background: url(data:image/gif;base64,R0lGODlhEAAQAPEBAAAAAL+/v////wAAACH5BAAAAAAALAAAAAAQABAAAAIfjG+iq4jM3IFLJipswNly/XkcBpIiVaInlLJr9FZWAQA7);
}
</style>
