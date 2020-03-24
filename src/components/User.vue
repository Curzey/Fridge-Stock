<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">Hello {{ this.$parent.activeUser ? this.$parent.activeUser.given_name : '$user' }}</h1>

		<b-row>
			<b-col lg="3">

        <Alert v-if="this.$parent.activeUser"
          :content="{
            show: this.$parent.activeUser.email_verified,
            variant: 'success',
            modifier: 'd-flex align-items-center',
            htmlContent: '<i class=\'gg-check-o mr-2\'></i> Okta account verified!'
          }"
        />
        <Alert v-if="this.$parent.activeUser"
          :content="{
            show: !this.$parent.activeUser.email_verified,
            variant: 'warning',
            modifier: 'd-flex align-items-center',
            htmlContent: '<i class=\'gg-danger mr-2\'></i> You need to verify your Okta account!'
          }"
        />

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
import Alert from '@/components/alert'

export default {
  components: {
    Alert
  },
  data () {
    return {
      loading: false,
      tables: [],
      model: {}
    }
  },
  async created () {
		this.tables = await api.getElements('tables')
  },
  methods: {
    async populateTableToEdit (table) {
      this.model = Object.assign({}, table)
    },
    async saveTable () {
      if (this.model.id) {
        await api.updateElement('tables', this.model.id, this.model)
      } else {
        await api.createElement('tables', this.model)
      }
      this.model = {} // reset form
      this.tables = await api.getElements('tables')
    },
    async deleteTable (id) {
      if (confirm('Are you sure you want to delete this table?')) {
        // if we are editing a table we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = {}
        }
        await api.deleteElement('tables', id)
        this.tables = await api.getElements('tables')
      }
    }
  }
}
</script>
