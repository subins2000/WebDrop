import Vue from 'vue'
import VueRouter, { RouteConfig } from 'vue-router'
import Grid from '../views/Grid.vue'
import Shares from '../components/Shares.vue'

Vue.use(VueRouter)

const routes: Array<RouteConfig> = [
  {
    path: '/grid',
    name: 'Grid',
    component: Grid
  },
  {
    path: '/',
    name: 'Shares',
    component: Shares
  },
  {
    path: '/about',
    name: 'About',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  }
]

const router = new VueRouter({
  routes
})

export default router
