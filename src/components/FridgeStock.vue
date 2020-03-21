<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">What's in my fridge?</h1>
    <b-alert :show="loading" variant="info">Loading...</b-alert>
    <b-row>
      <b-col>

				<div
					v-for="(table, index) in tables"
					:key="index">

					<h3>{{ table }}</h3>

					<b-alert
						:show="tableItems.filter(tableItem => tableItem.table === table).length === 0"
						variant="warning">

						{{ table }} is all empty. Quickly, go shopping!!
					</b-alert>

					<div
						class="table-item"
						v-for="(item, index) in tableItems.filter(tableItem => tableItem.table === table)"
						:key="index">

						{{ item.title }}
						<a href="#" @click.prevent="populateTableItemToEdit(item)">Edit</a> -
						<a href="#" @click.prevent="deleteTableItem(item.id)">Delete</a>
					</div>

				</div>

      </b-col>
      <b-col lg="3">
        <b-card :title="(model.id ? 'Edit ' + model.title : 'New Item')">
          <form @submit.prevent="saveTableItem">
            <b-form-group label="Title">
              <b-form-input type="text" v-model="model.title"></b-form-input>
            </b-form-group>
						<b-form-group label="qty">
							<b-form-input type="number" v-model="model.qty"></b-form-input>
						</b-form-group>
            <b-form-group label="category">
              <b-form-input type="text" v-model="model.category"></b-form-input>
            </b-form-group>
						<b-form-group label="table">
							<b-form-select v-model="model.table" :options="tables"></b-form-select>
						</b-form-group>
            <div>
              <b-btn type="submit" variant="success">Save Item</b-btn>
            </div>
          </form>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import api from '@/api'
export default {
  data () {
    return {
      loading: false,
      tableItems: [],
      model: {},
      tables: []
		}
  },
  async created () {
    this.refreshTableItems()
		this.tablesAsArray()
  },
  methods: {
    async refreshTableItems () {
      this.loading = true
      this.tableItems = await api.getTableItems()
      this.loading = false
    },
		async tablesAsArray () {
			for (const [key, val] of Object.entries(await api.getTables())) {
				this.tables.push(val.title)
			}
			// const tables = await api.getTables()
			// const arr = tables.map(item => {
			// 	const { title, ...other } = item
			// 	return Object.values(other)
			// })
			//
			// this.tables = arr.flat()
		},
    async populateTableItemToEdit (tableItem) {
      this.model = Object.assign({}, tableItem)
    },
    async saveTableItem () {
      if (this.model.id) {
        await api.updateTableItem(this.model.id, this.model)
      } else {
        await api.createTableItem(this.model)
      }
      this.model = {} // reset form
      await this.refreshTableItems()
    },
    async deleteTableItem (id) {
      if (confirm('Are you sure you want to delete this tableItem?')) {
        // if we are editing a tableItem we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = {}
        }
        await api.deleteTableItem(id)
        await this.refreshTableItems()
      }
    }
  }
}
</script>
