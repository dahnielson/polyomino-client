import Vue from 'vue'
import Router from 'vue-router'
import ListTournaments from '@/components/ListTournaments'
import AdminTournament from '@/components/AdminTournament'
import ViewTournament from '@/components/ViewTournament'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'list',
      component: ListTournaments
    },
    {
      path: '/admin',
      name: 'admin',
      component: AdminTournament
    },
    {
      path: '/view',
      name: 'view',
      component: ViewTournament
    }
  ]
})
