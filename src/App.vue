<template lang="jade">
.container
  .row
    .column.column-60
      .title Result
      result
    .column
      .title Color palette
      color-palette
      .title Color
      color
      .title Opacity
      opacity
      buttons
</template>

<script>
import Result       from './Result.vue';
import Buttons      from './Buttons.vue';

import ColorPalette from './configuration/ColorPalette.vue';
import Color        from './configuration/Color.vue';
import Opacity      from './configuration/Opacity.vue';

export default {
  components: {
    Result,
    ColorPalette,
    Color,
    Opacity,
    Buttons
  },
  data () {
    return {
    }
  }
};
</script>

<style>
body {
  background: whitesmoke;
  user-select: none;
}
.container {
  margin: 20px auto;
  padding: 0;
  width: 1140px;
}
.title:not(:first-child) {
  margin-top: 20px;
}
</style>
