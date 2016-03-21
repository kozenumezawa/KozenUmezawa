<template lang="jade">
.container
  .row
    .column.column-60
      .title Result
      result
    .column
      color
      radius
      buttons
</template>

<script>
import 'normalize-css';
import 'milligram';

import Result  from './Result.vue';
import Buttons from './Buttons.vue';
import Color   from './configuration/Color.vue';
import Radius  from './configuration/Radius.vue';

export default {
  components: {
    Result,
    Color,
    Radius,
    Buttons
  },
  data () {
    return {
      spectrum: [],
      radius: []
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
}
.container {
  margin: 20px auto;
  padding: 0;
  width: 1140px;
}
.title:not(:first-child) {
  margin-top: 18px;
}
</style>
