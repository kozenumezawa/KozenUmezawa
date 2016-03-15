<template lang="jade">
._buttons
  .row
    .column.column-50: a.button(@click="emit('apply')") Apply
    .column.column-25: a.button Undo
    .column.column-25: a.button Redo
  .row
    .column.column-50: a.button(@click="emit('reset')") Reset
    .column.column-50: a.button Save
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
  margin-top: 20px;
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
