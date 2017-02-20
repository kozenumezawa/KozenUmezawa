<template lang="pug">
._buttons
  .row
    .column.column-30: a.button(@click="reset") Reset
</template>

<script>
export default {
  methods: {
    reset() {
      this.$parent.emit('reset');
      this.$parent.emit('updateTransferFunction');
    }
  }
};
</script>

<style scoped>
._buttons {
  margin-top: 18px;
}
.button {
  background-color: #666;
  border: none;
  width: 100%;
}
.button:hover {
  background-color: #777;
}
.button:active {
  transform: translateY(1px);
}
</style>
