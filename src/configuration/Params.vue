<template lang="jade">
.title Params
.row
  .column.column-50
    label
      .float-left α<sub>0</sub>
      .float-right: small {{ alphaZero }}
    input(type="range" max="0.99" min="0.0" step="0.01" v-model="alphaZero" @change="update('alphaZero')")
  .column.column-50
    label
      .float-left r<sub>0</sub>
      .float-right: small {{ rZero }}
    input(type="range" max="0.99" min="0.0" step="0.01" v-model="rZero" @change="update('rZero')")
</template>

<script>
export default {
  ready () {
    this.alphaZero = this.$parent.alphaZero;
    this.rZero = this.$parent.rZero;
  },
  data () {
    return {
      alphaZero: 0,
      rZero: 0
    }
  },
  methods: {
    update (type) {
      this.$parent[type] = this[type];
    }
  },
}
</script>

<style scope>
input[type=range] {
  width: 100%;
}
</style>
