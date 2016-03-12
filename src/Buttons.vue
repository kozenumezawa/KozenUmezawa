<template lang="jade">
._buttons
  .row
    .column.column-50: a.button(@click="reset") Reset
    .column.column-25: a.button Undo
    .column.column-25: a.button Redo
  .row
    .column.column-50: a.button Save
    .column.column-50: a.button Apply
</template>

<script>
export default {
  methods: {
    reset () {
      this.$parent.reset();
    }
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
