import Vue from 'vue'
import Router from 'vue-router'
import TheProjects from './views/TheProjects'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'projects',
      component: TheProjects
    },
  ]
})
