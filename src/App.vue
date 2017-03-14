<template lang="pug">
.container
  .row(v-if="supportWebGL")
    .column.column-50.centering
      result
    .column.column-50.centering
      .title Ray-casting
      iframe#ray-casting(src="./w14/index.html", width="640", height="640")
  .row
    .column.column-30
      p info
    .column.column-70.centering
      canvas#diff-image(width="640", height="640")
</template>

<script>
import 'normalize.css/normalize.css';
import 'milligram';

export default {
  components: {
    result: require('./components/Result.vue'),
    buttons: require('./components/Buttons.vue')
  },
  data () {
    return {
      maxValue: 1,
      minValue: 0,
      diffs: 0,
    };
  },
  computed: {
    supportWebGL: () => {
      try {
        const c = document.createElement('canvas');
        return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
      } catch (e) {
        return false;
      }
    }
  },
  methods: {
    emit (name) {
      this.$broadcast(name);
    }
  }
};
</script>

<style>
body {
  background: whitesmoke;
  user-select: none;
  padding: 24px 0;
}
.centering {
  text-align: center;
}
.container {
  margin: 20px auto;
  padding: 0;
  width: 1280px;
  max-width: 100% !important;
}
.title:not(:first-child) {
  margin-top: 8px;
}
.unsupported {
  text-align: center;
}
.row {
  width: 100% !important;
}
#ray-casting {
  border: none;
  margin-right: 30px;
}
#diff-image {
  transform: rotate(90deg);
}
</style>
