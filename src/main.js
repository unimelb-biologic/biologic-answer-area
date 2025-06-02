import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import Home from './Home/Home.vue'

import './assets/biologic.css'; // import global styles

// Vuetify
import 'vuetify/styles'
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import '@mdi/font/css/materialdesignicons.css'



// Define route map
const routes = [
  /* more router */
    { path: '/', redirect: '/home' },
    { path: '/home', component: Home },
    // { path: '/feedback', component: Feedback },
]

// Create a routing instance and pass the corresponding configuration
const router = createRouter({
  // history mode, used createWebHistory
  history: createWebHashHistory(),
  // Pass route map
  routes
})

// Create Vuetify instance
const vuetifyInstance = createVuetify({
  components,
  directives,
  icons: {
      defaultSet: 'mdi', // This is already the default value - only for display purposes
  },
})

window.globalConsoleLog = (category = "any", ...args) => {
  const allowedCategories = [/*"geom", "undo", "any","net"*/"conn"];
//  const allowedCategories = ["geom"];

  if (allowedCategories.includes(category)) {
    console.log(`[${category}]`, ...args); // Spread to preserve multiple arguments
  }
};

const app = createApp(App);
app.config.unwrapInjectedRef = true;
app.use(router).use(vuetifyInstance).mount('#app')