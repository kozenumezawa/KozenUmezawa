<template lang="jade">
.title Opacity
canvas#opacity
</template>

<script>
export default {
  computed: {
    canvas () {
      return document.querySelector('#opacity');
    }
  },
  ready () {
    const context = this.canvas.getContext('2d');
    context.rect(0, 0, this.canvas.width, this.canvas.height);
    const grd = context.createLinearGradient(0, this.canvas.height/2, this.canvas.width, this.canvas.height/2);
    grd.addColorStop(0, '#ffffff');
    grd.addColorStop(1, '#000000');
    context.fillStyle = grd;
    context.fill();
  },
};
</script>

<style scoped>
#opacity {
  background: url(data:image/gif;base64,R0lGODlhEAAQAPEBAAAAAL+/v////wAAACH5BAAAAAAALAAAAAAQABAAAAIfjG+iq4jM3IFLJipswNly/XkcBpIiVaInlLJr9FZWAQA7);
  width: 100%;
  height: 80px;
}
</style>
