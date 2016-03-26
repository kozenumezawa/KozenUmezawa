<template lang="jade">
._buttons
  .row
    .column.column-30
    .column.column-40: a.button(@click="emit('reset')") Reset
    .column.column-30
</template>

<script>
export default {
  methods: {
    emit (name) {
      this.$parent.emit(name);
    },
  }
}
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
