<template lang="jade">
canvas#color
</template>

<script>
export default {
  ready () {
    const canvas = this.$el;
    const context = canvas.getContext('2d');
    context.rect(0, 0, canvas.width, canvas.height);
    const grd = context.createLinearGradient(0, canvas.height/2, canvas.width, canvas.height/2);
    grd.addColorStop(0.00, '#0000ff');
    grd.addColorStop(0.25, '#00ffff');
    grd.addColorStop(0.50, '#00ff00');
    grd.addColorStop(0.75, '#ffff00');
    grd.addColorStop(1.00, '#ff0000');
    context.fillStyle = grd;
    context.fill();
  },
};
</script>

<style scoped>
#color {
  width: 100%;
  height: 40px;
}
</style>
