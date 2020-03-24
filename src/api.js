import Vue from 'vue'
import axios from 'axios'

const client = axios.create({
  baseURL: 'http://api.curzey.dk/',
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
  getElements (query) {
    return this.execute('get', `/${query}`)
  },
  getElement (query, id) {
    return this.execute('get', `/${query}/${id}`)
  },
  createElement (query, data) {
    return this.execute('post', `/${query}`, data)
  },
  updateElement (query, id, data) {
    return this.execute('put', `/${query}/${id}`, data)
  },
  deleteElement (query, id) {
    return this.execute('delete', `/${query}/${id}`)
  }
}
