<template lang="jade">
.title Opacity
canvas#opacity(width="430" height="60")
</template>

<script>
export default {
  computed: {
    canvas: () => document.querySelector('#opacity')
  },
  ready () {
    this.init();
  },
  methods: {
    init () {
      const context = this.canvas.getContext('2d');
      context.rect(0, 0, this.canvas.width, this.canvas.height);
      const grd = context.createLinearGradient(0, this.canvas.height/2, this.canvas.width, this.canvas.height/2);
      grd.addColorStop(0, 'rgba(255,255,255,0)');
      grd.addColorStop(1, 'rgba(0, 0, 0, 1)');
      context.fillStyle = grd;
      context.fill();
    }
  }
};
</script>

<style scoped>
#opacity {
  background: url(data:image/gif;base64,R0lGODlhEAAQAPEBAAAAAL+/v////wAAACH5BAAAAAAALAAAAAAQABAAAAIfjG+iq4jM3IFLJipswNly/XkcBpIiVaInlLJr9FZWAQA7);
}
</style>
