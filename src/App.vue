<template lang="jade">
.container
  .row(v-if="supportWebGL")
    .column.column-60
      result
    .column.column-40
      color
      opacity
      params
      ensemble
      buttons
  .unsupported(v-if="!supportWebGL")
    p: strong
      | The browser that you're using does not support WebGL technology.<br>
      | Please use a newer browser instead, or check if the feature is enabled.
    p: a(href="http://webglreport.com/") WebGL Report
    p: a(href="http://caniuse.com/#feat=webgl") Can I use? - WebGL
</template>

<script>
import 'normalize.css/normalize.css';
import 'milligram';

import Result  from './components/Result.vue';
import Color   from './components/Color.vue';
import Opacity  from './components/Opacity.vue';
import Params  from './components/Params.vue';
import Buttons from './components/Buttons.vue';
import Ensemble from './components/Ensemble.vue';

export default {
  components: {
    Result,
    Color,
    Opacity,
    Params,
    Ensemble,
    Buttons
  },
  data () {
    return {
      spectrum: [],
      opacity: [],
      alphaZero: 0.3,
      rZero: 0.9,
      maxValue: 1,
      minValue: 0,
      ensembleN: 2,
      applyImmediately: true
    }
  },
  computed: {
    supportWebGL: () => {
      try {
        const c = document.createElement('canvas');
        return !! (window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
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
.container {
  margin: 20px auto;
  padding: 0;
  width: 1140px;
}
.title:not(:first-child) {
  margin-top: 8px;
}
.unsupported {
  text-align: center;
}
</style>
