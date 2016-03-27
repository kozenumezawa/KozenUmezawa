<template lang="jade">
.message(v-if="show")
  .message-header WARNING
  .message-body
    | The number of vertices are critically large.
    | This may cause slow performance and eventually the browser will crash.<br>
    | Do you want to continue?
    .button-wrapper.clearfix
      a.button.float-right(@click="cancel") Cancel
      a.button.float-right(@click="ok") OK
</template>

<script>
export default {
  props: {
    show: {type: Boolean, required: true}
  },
  methods: {
    ok () {
      this.show = false;
      this.$parent.addPointsToScene();
    },
    cancel () {
      this.show = false;
    }
  }
}
</script>

<style scoped>
.message {
  position: fixed;
  top: 100px;
  left: 50%;
  margin-left: -250px;
  width: 500px;
  border-radius: 5px;
  background: #fdeeed;
  overflow: hidden;
  box-shadow: 0 0 0 9999px rgba(0,0,0,0.5);
}
.message-header {
  background: #ed6c63;
  color: white;
  font-size: 12px;
  font-weight: bold;
  padding: 2px 10px;
}
.message-body {
  padding: 10px;
  font-size: 13px;
  border: 1px solid #ed6c63;
  color: #be4941;
}
a.button {
  display: inline-block;
  font-size: 1rem;
  height: 2.8rem;
  line-height: 2.8rem;
  margin: 0 0 0 5px;
  padding: 0 1.5rem;
  width: 100px;
  border: 0;
  background: #ed6c63;
}
</style>
