import Vue from 'vue'
import VueRouter from 'vue-router'
import EleUI from '../views/EleUI.vue'
import Map from '../views/Map.vue'
import Echartme from '../views/Echartme.vue'
import MapVme from '../views/MapVme.vue'
import Layout from '../views/Layout.vue'
import MapNew from '../views/MapNew.vue'



Vue.use(VueRouter)

  const routes = [
  {
    path: '/eleui',
    name: 'EleUI',
    component: EleUI
  },
  {
    path: '/chart',
    name: 'EleEchartmeUI',
    component: Echartme
  },
  {
    path: '/map',
    name: 'Map',
    component: Map
  },
  {
    path: '/v',
    name: 'MapVme',
    component: MapVme
  },
  {
    path: '/',
    name: 'layout',
    component: Layout
  }, 
  {
    path: '/mapnew',
    name: 'mapnew',
    component: MapNew
  },
  
  // {
  //   path: '/about',
  //   name: 'About',
  //   // route level code-splitting
  //   // this generates a separate chunk (about.[hash].js) for this route
  //   // which is lazy-loaded when the route is visited.
  //   component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  // }
]

const router = new VueRouter({
  routes
})

export default router
