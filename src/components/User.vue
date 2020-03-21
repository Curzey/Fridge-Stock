<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">Hello {{ this.$parent.activeUser ? this.$parent.activeUser.given_name : '$user' }}</h1>

		<b-row>
			<b-col lg="3">
				<b-card :title="'Your tables'">
					<form @submit.prevent="saveTable">
						<b-form-group label="">
							<b-form-input type="text" v-model="model.title"></b-form-input>
						</b-form-group>
						<div>
							<b-btn type="submit" variant="success">Save Item</b-btn>
						</div>
					</form>
				</b-card>

				<b-list-group>
				  <b-list-group-item v-for="(table, index) in tables" :key="index">
						{{ table.title }}
						<a href="#" @click.prevent="populateTableToEdit(table)">Edit</a> -
						<a href="#" @click.prevent="deleteTable(table.id)">Delete</a>
					</b-list-group-item>
				</b-list-group>
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
      tables: [],
      model: {}
    }
  },
  async created () {
    this.refreshTables()
  },
  methods: {
    async refreshTables () {
      this.loading = true
      this.tables = await api.getTables()
      this.loading = false
    },
    async populateTableToEdit (table) {
      this.model = Object.assign({}, table)
    },
    async saveTable () {
      if (this.model.id) {
        await api.updateTable(this.model.id, this.model)
      } else {
        await api.createTable(this.model)
      }
      this.model = {} // reset form
      await this.refreshTables()
    },
    async deleteTable (id) {
      if (confirm('Are you sure you want to delete this table?')) {
        // if we are editing a table we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = {}
        }
        await api.deleteTable(id)
        await this.refreshTables()
      }
    }
  }
}
</script>
