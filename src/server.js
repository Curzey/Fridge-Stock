const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const Sequelize = require('sequelize')
const finale = require('finale-rest')
const OktaJwtVerifier = require('@okta/jwt-verifier')

const oktaJwtVerifier = new OktaJwtVerifier({
  clientId: '0oa4migwmnIE1hFZX4x6',
  issuer: 'https://dev-558941.okta.com/oauth2/default'
})

let app = express()
app.use(cors())
app.use(bodyParser.json())

// verify JWT token middleware
app.use((req, res, next) => {
  // require every request to have an authorization header
  if (!req.headers.authorization) {
    return next(new Error('Authorization header is required'))
  }
  let parts = req.headers.authorization.trim().split(' ')
  let accessToken = parts.pop()
  oktaJwtVerifier.verifyAccessToken(accessToken)
    .then(jwt => {
      req.user = {
        uid: jwt.claims.uid,
        email: jwt.claims.sub
      }
      next()
    })
    .catch(next) // jwt did not verify!
})

// For ease of this tutorial, we are going to use SQLite to limit dependencies
let database = new Sequelize({
  dialect: 'sqlite',
  storage: './fridge-db.sqlite'
})

// Define our TableItem model
// id, createdAt, and updatedAt are added by sequelize automatically
let TableItem = database.define('tableItems', {
  title: Sequelize.STRING,
  qty: Sequelize.INTEGER,
  category: Sequelize.STRING,
  table: Sequelize.STRING
})

let Table = database.define('tables', {
  title: Sequelize.STRING
})

// Initialize finale
finale.initialize({
  app: app,
  sequelize: database
})

// Create the dynamic REST resource for our TableItem model
let userResource = finale.resource({
  model: TableItem,
  endpoints: ['/tableItems', '/tableItems/:id']
})

let tableResource = finale.resource({
  model: Table,
  endpoints: ['/tables', '/tables/:id']
})

// Resets the database and launches the express app on :8081
database
  .sync({ force: true })
  .then(() => {
    app.listen(8081, () => {
      console.log('listening to port localhost:8081')
    })
  })
