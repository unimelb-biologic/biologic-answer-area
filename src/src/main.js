import { createApp } from 'vue'
import App from './App.vue'
// Create Router
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './Home/Home.vue'
import Feedback from './Feedback/Feedback.vue'
// Define route map
const routes = [
  /* more router */
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    { path: '/feedback', component: Feedback },
]
// Create a routing instance and pass the corresponding configuration
const router = createRouter({
  // history mode, used createWebHistory
  history: createWebHashHistory(),
  // Pass route map
  routes
})
createApp(App).use(router).mount('#app')

