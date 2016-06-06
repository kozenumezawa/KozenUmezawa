<template lang="jade">
.title EnsembleAverage
.row
  .column.column-100
    .float-right: {{ ensembleN }}
    input(type="range" max="50" min="1" step="1" v-model="ensembleN" @change="update()" debounce="500")
</template>

<script>
export default {
  ready (){
    this.init();

    this.$on('reset', () => {
      this.$parent.ensembleN = 2;
      this.init();
      this.$parent.emit('updateEnsembleN');
    });
  },
  data (){
    return {
      ensembleN: 2
    }
  },
  methods: {
    init (){
      this.ensembleN = this.$parent.ensembleN;
    },
    update (){
      this.$parent.ensembleN = this.ensembleN;
      this.$parent.emit('updateEnsembleN');
    }
  },
}
</script>

<style scepe>
input[type=range] {
  width: 100%;
}
</style>


