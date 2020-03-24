'use strict'

const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  VUE_APP_OKTA_REDIRECT_URI: '"http://app.curzey.dk/implicit/callback"',
  VUE_APP_API_BASEURL: '"http://localhost:8081/"'
})
