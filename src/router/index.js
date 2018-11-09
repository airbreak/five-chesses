import Vue from 'vue'
import Router from 'vue-router'
import Chesses from '@/components/chesses'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'chesses',
      component: Chesses
    }
  ]
})
