<template lang="jade">
._buttons
  .row
    .column.column-40
      input#apply-immediately(type="checkbox" v-model="applyImmediately" @change="toggle")
      label.label-inline(for="apply-immediately") Apply Immediately
    .column.column-30: a.button(@click="emit('apply')") Apply
    .column.column-30: a.button(@click="emit('reset')") Reset
</template>

<script>
export default {
  data () {
    return {
      applyImmediately: this.$parent.applyImmediately
    }
  },
  methods: {
    emit (name) {
      this.$parent.emit(name);
    },
    toggle () {
      this.$parent.applyImmediately = this.applyImmediately;
    }
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
#apply-immediately, #apply-immediately + label {
  cursor: pointer;
}
#apply-immediately {
  margin-top: 14px;
}
</style>
