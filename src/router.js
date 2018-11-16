import Vue from 'vue'
import Router from 'vue-router'
import TheProjects from './views/TheProjects'
import TheProject from './views/TheProject'


Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'projects',
      component: TheProjects
    },
    {
      path: '/project/:id',
      name: 'project',
      component: TheProject
    },
  ]
})
