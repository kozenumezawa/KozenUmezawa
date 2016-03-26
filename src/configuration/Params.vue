<template lang="jade">
.title Params
.row
  .column.column-50
    label
      .float-left α<sub>0</sub>
      .float-right: small {{ alphaZero }}
    input(type="range" max="0.99" min="0.01" step="0.01" v-model="alphaZero" @change="update('alphaZero')" debounce="500")
  .column.column-50
    label
      .float-left r<sub>0</sub>
      .float-right: small {{ rZero }}
    input(type="range" max="0.99" min="0.01" step="0.01" v-model="rZero" @change="update('rZero')" debounce="500")
</template>

<script>
export default {
  ready () {
    this.init();

    this.$on('reset', () => {
      this.$parent.alphaZero = 0.3;
      this.$parent.rZero = 0.9;
      this.init();
    });
  },
  data () {
    return {
      alphaZero: 0,
      rZero: 0
    }
  },
  methods: {
    init () {
      this.alphaZero = this.$parent.alphaZero;
      this.rZero = this.$parent.rZero;
    },
    update (type) {
      this.$parent[type] = this[type];
      this.$parent.emit('render');
    }
  },
}
</script>

<style scope>
input[type=range] {
  width: 100%;
}
</style>
