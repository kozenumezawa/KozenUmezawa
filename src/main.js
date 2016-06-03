import Vue from 'vue';
import App from './App.vue';
import './register-worker'

Vue.config.debug = true;

new Vue({
  el: 'body',
  components: { App }
});
