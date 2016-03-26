<template lang="jade">
.container
  .row
    .column.column-60
      result
    .column
      color
      radius
      params
      buttons
</template>

<script>
import 'normalize.css/normalize.css';
import 'milligram';

import Result  from './Result.vue';
import Color   from './configuration/Color.vue';
import Radius  from './configuration/Radius.vue';
import Params  from './configuration/Params.vue';
import Buttons from './Buttons.vue';

export default {
  components: {
    Result,
    Color,
    Radius,
    Params,
    Buttons
  },
  data () {
    return {
      spectrum: [],
      radius: [],
      alphaZero: 0.3,
      rZero: 0.9
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
  padding-top: 24px;
}
.container {
  margin: 20px auto;
  padding: 0;
  width: 1140px;
}
.title:not(:first-child) {
  margin-top: 8px;
}
</style>
