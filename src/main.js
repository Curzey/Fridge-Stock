
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import moment from 'moment'
import momentTZ from 'moment-timezone'
import api from '@/api'
import Cookies from 'js-cookie'

Vue.filter('formatDate', function(value) {
  if (value) {
    return moment(momentTZ().tz('Europe/Copenhagen')).format('DD/MM/YYYY HH:mm')
  }
})

Vue.config.productionTip = false

// Custom directive for autofocus input fields
Vue.directive('focus', {
  inserted: function (el) {
    el.focus()
  }
})

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
