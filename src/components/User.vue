<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">Hello {{ activeUser ? activeUser.given_name : '$user' }}</h1>

		<b-row>
			<b-col lg="3">

        <Alert v-if="activeUser"
          :content="{
            show: activeUser.email_verified,
            variant: 'success',
            modifier: 'd-flex align-items-center',
            htmlContent: '<i class=\'gg-check-o mr-2\'></i> Okta account verified!'
          }"
        />
        <Alert v-if="activeUser"
          :content="{
            show: !activeUser.email_verified,
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
      model: {},
      activeUser: null
    }
  },
  async created () {
    await this.addUserToDB()
    await this.getUserItems()
  },
  methods: {
    async getUserItems () {
      const userTables = await api.getElements('tables')
      this.tables = userTables.filter(item => item.user === this.activeUser.sub)
    },
    async populateTableToEdit (table) {
      this.model = Object.assign({}, table)
    },
    async addUserToDB () {
      this.activeUser = await this.$auth.getUser()
      const usersObj = await api.getElements('users')

      // Only add user entry if user is new
      if ( !usersObj.find(x => this.activeUser.sub === x.sub) ) {
        await api.createElement('users', this.activeUser)
      }

      this.model.user = this.activeUser.sub
    },
    async saveTable () {
      if (this.model.id) {
        await api.updateElement('tables', this.model.id, this.model)
      } else {
        await api.createElement('tables', this.model)
      }
      this.model = { user: this.activeUser.sub } // reset form
      await this.getUserItems()
    },
    async deleteTable (id) {
      if (confirm('Are you sure you want to delete this table?')) {
        // if we are editing a table we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = { user: this.activeUser.sub } // reset form
        }
        await api.deleteElement('tables', id)
        await this.getUserItems()
      }
    }
  }
}
</script>
