<template>
  <div class="container-fluid mt-4">
    <h1 class="h1">{{ language.user.hello }} {{ activeUser ? `${activeUser.given_name} ${activeUser.family_name}` : '$user' }}</h1>

		<b-row>
			<b-col lg="3">

        <Alert v-if="activeUser"
          :content="{
            show: activeUser.email_verified,
            variant: 'success',
            modifier: 'd-flex align-items-center',
            htmlContent: '<i class=\'gg-check-o mr-2\'></i> ' + language.user.okta_verified
          }"
        />
        <Alert v-if="activeUser"
          :content="{
            show: !activeUser.email_verified,
            variant: 'warning',
            modifier: 'd-flex align-items-center',
            htmlContent: '<i class=\'gg-danger mr-2\'></i> ' + language.user.okta_not_verified
          }"
        />

				<b-card :title="language.user.add_tables" class="mb-3">
          <div class="help mb-4">
            <p class="help-description mb-1">{{ language.user.add_help }}</p>
            <div class="label-group">
              <span class="label">{{ language.user.examples }}</span>
              <b-badge class="mr-2" variant="info" v-for="(example, index) in help_examples" :key="index">
                {{ example }}
              </b-badge>
            </div>
          </div>
					<form @submit.prevent="saveTable">
						<b-form-group label="">
							<b-form-input type="text" required v-model="model.title"></b-form-input>
						</b-form-group>
						<div>
							<b-btn type="submit" variant="success">{{ language.user.save_item }}</b-btn>
						</div>
					</form>
				</b-card>

        <b-card :title="language.user.your_tables" class="mb-3">
        <div class="help mb-4">
          <p class="help-description mb-1">{{ language.user.your_tables_help }}</p>
          <b-button class="p-0" to="/fridge-stock" variant="link">{{ language.user.add_items_to_table }}</b-button>
        </div>
  				<b-list-group>
  				  <b-list-group-item v-for="(table, index) in tables" :key="index">
  						{{ table.title }}
  						<a href="#" @click.prevent="populateTableToEdit(table)">{{ language.user.edit }}</a> -
  						<a href="#" @click.prevent="deleteTable(table.id)">{{ language.user.delete }}</a>
  					</b-list-group-item>
  				</b-list-group>
        </b-card>
			</b-col>

      <b-col lg="3">
        <b-card :title="language.user.language" class="mb-3">
          <b-dropdown id="dropdown-1" :text="language.user.choose_language" class="m-md-2">
            <b-dropdown-item><a href="#" @click.prevent="setNewLanguage('da')">Dansk</a></b-dropdown-item>
            <b-dropdown-item><a href="#" @click.prevent="setNewLanguage('en')">English</a></b-dropdown-item>
          </b-dropdown>
          <div>
            <strong>{{ language.user.active_language }}</strong>
            <b-badge variant="info">{{ this.$parent.prefferedLanguage.title }}</b-badge>
          </div>
        </b-card>
      </b-col>
		</b-row>


  </div>
</template>

<script>
import api from '@/api'
import Alert from '@/components/alert'
import Vue from 'vue'

export default {
  components: {
    Alert
  },
  data () {
    return {
      loading: false,
      tables: [],
      model: {},
      activeUser: null,
      language: this.$parent.prefferedLanguage,
      help_examples: []
    }
  },
  async created () {
    await this.addUserToDB()
    await this.getUserItems()
    this.language = this.$parent.prefferedLanguage
    await this.helpExamplesAsArray(this.language.user.add_help_examples)
  },
  methods: {
    async helpExamplesAsArray (string) {
      this.help_examples = string.split(',')
    },
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
    },
    async setNewLanguage (lang) {
      const users = await api.getElements('users')
      const dbActiveUser = users.find(item => item.sub === this.activeUser.sub)
      this.activeUser.lang = lang
      await api.updateElement('users', dbActiveUser.id, this.activeUser)
      location.reload()
    }
  }
}
</script>
