import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import FridgeStock from '@/components/FridgeStock'
import User from '@/components/User'
import Auth from '@okta/okta-vue'
import api from '@/api'

// Use OKTA authentication
Vue.use(Auth, {
  issuer: 'https://dev-558941.okta.com/oauth2/default',
  client_id: '0oa4migwmnIE1hFZX4x6',
  redirect_uri: process.env.VUE_APP_OKTA_REDIRECT_URI,
  scope: 'openid profile email'
})

Vue.use(Router)

let router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'Hello',
      component: Hello
    },
    {
      path: '/implicit/callback',
      component: Auth.handleCallback() // Okta redirects back to app after authentication.
    },
    {
      path: '/fridge-stock',
      name: 'FridgeStock',
      component: FridgeStock,
      meta: {
        requiresAuth: true // Tells Oktas auth guard that this route needs login
      }
    },
    {
      path: '/user',
      name: 'User',
      component: User,
      meta: {
        requiresAuth: true // Tells Oktas auth guard that this route needs login
      }
    }
  ]
})

// checks matched routes’ metadata for the key requiresAuth and
// redirects the user to the authentication flow if they are not authenticated.
router.beforeEach(Vue.prototype.$auth.authRedirectGuard())

export default router
