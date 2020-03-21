import Vue from 'vue'
import axios from 'axios'

const client = axios.create({
  baseURL: 'http://localhost:8081/',
  json: true
})

export default {
  async execute (method, resource, data) {
    // inject the accessToken for each request
    let accessToken = await Vue.prototype.$auth.getAccessToken()
    return client({
      method,
      url: resource,
      data,
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }).then(req => {
      return req.data
    })
  },
  getTableItems () {
    return this.execute('get', '/tableItems')
  },
  getTableItem (id) {
    return this.execute('get', `/tableItems/${id}`)
  },
  createTableItem (data) {
    return this.execute('post', '/tableItems', data)
  },
  updateTableItem (id, data) {
    return this.execute('put', `/tableItems/${id}`, data)
  },
  deleteTableItem (id) {
    return this.execute('delete', `/tableItems/${id}`)
  },

  getTables () {
    return this.execute('get', '/tables')
  },
  getTable (id) {
    return this.execute('get', `/tables/${id}`)
  },
  createTable (data) {
    return this.execute('post', '/tables', data)
  },
  updateTable (id, data) {
    return this.execute('put', `/tables/${id}`, data)
  },
  deleteTable (id) {
    return this.execute('delete', `/tables/${id}`)
  }

}
