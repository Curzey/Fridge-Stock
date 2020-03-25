<template>
  <div class="container-fluid mt-4">
    <h1 class="h1 mt-5 mb-4">What's in my fridge?</h1>
    <b-alert :show="loading" class="d-flex align-items-center" variant="info"><i class="gg-spinner mr-2"></i> Loading... </b-alert>

    <b-jumbotron :lead="(model.id ? 'Edit ' + model.title : 'New Item')">
      <b-form inline @submit.prevent="saveTableItem">

        <label class="sr-only" for="inline-form-input-title">Title</label>
        <b-input-group prepend="<i class='gg-chevron-double-right'></i>" class="mb-2 mr-sm-2 mb-sm-0">
          <b-input v-model="model.title" id="inline-form-input-title" required placeholder="Title"></b-input>
        </b-input-group>

        <label class="sr-only" for="inline-form-input-quantity">Quantity</label>
        <b-input-group prepend="<i class='gg-infinity'></i>" class="mb-2 mr-sm-2 mb-sm-0">
          <b-input type="number" v-model="model.qty" id="inline-form-input-quantity" placeholder="Quantity"></b-input>
        </b-input-group>

        <label class="sr-only" for="inline-form-input-unit">Unit</label>
        <b-input-group prepend="<i class='gg-gym'></i>" class="mb-2 mr-sm-2 mb-sm-0">
          <b-input v-model="model.unit" id="inline-form-input-unit" placeholder="Unit"></b-input>
        </b-input-group>

        <label class="sr-only" for="inline-form-input-category">Category</label>
        <b-input-group prepend="<i class='gg-qr'></i>" class="mb-2 mr-sm-2 mb-sm-0">
          <b-input v-model="model.category" id="inline-form-input-category" placeholder="Category"></b-input>
        </b-input-group>

        <label class="sr-only" for="inline-form-input-table">Table</label>
        <b-input-group prepend="<i class='gg-row-first'></i>" class="mb-2 mr-sm-2 mb-sm-0">
          <b-form-select required v-model="model.table" :options="tables"></b-form-select>
        </b-input-group>

        <b-button type="submit" variant="primary">Save</b-button>
      </b-form>
    </b-jumbotron>

    <b-row>
      <b-col>
				<div
					v-for="(table, index) in tables.filter(table => !table.skip)"
					:key="index"
          class="mb-3">

					<h3>{{ table.title }}</h3>

					<b-alert
						:show="tableItems.filter(tableItem => tableItem.table === table.id).length === 0"
						variant="warning">

						{{ table.title }} is all empty. Quickly, go shopping!!
					</b-alert>

          <b-card-group columns>
            <div
              v-for="(item, index) in tableItems.filter(tableItem => tableItem.table === table.id)"
              :key="index"
              :data-handle="handleizeString(item.title)">
              <b-card
                :border-variant="( item.qty > 0 ? 'success' : 'danger' )"
                :header="item.title"
                align="center"
              >
                <div class="d-flex flex-column align-items-center">
                  <div class="d-flex flex-wrap align-items-center justify-content-center mb-3">
                    <b-badge class="m-1 d-flex align-items-center" pill variant="light"><i class="gg-bowl mr-2"></i> <span class="text-muted">{{ item.category }}</span></b-badge>
                    <b-badge class="m-1 d-flex align-items-center" pill variant="light"><i class="gg-gym ml-1 mr-2"></i> <span class="text-muted">{{ item.qty }} {{ item.unit }}</span></b-badge>
                    <b-badge class="m-1 d-flex align-items-center" pill variant="light"><i class="gg-time mr-2"></i> <span class="text-muted">{{ item.updatedAt | formatDate }}</span></b-badge>
                  </div>
                  <b-button-group size="sm">
                    <a class="btn btn-info" href="#" variant="info" @click="populateTableItemToEdit(item)">Edit</a>
                    <a class="btn btn-warning" href="#" variant="warning" @click="deleteTableItem(item.id)">Delete</a>
                  </b-button-group>
                </div>
              </b-card>
            </div>
          </b-card-group>

				</div>
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
      model: { table: null }, // initialize model with nulled table value for the default selected option in form
      tables: [],
      activeUser: null
		}
  },
  async created () {
    this.activeUser = await this.$auth.getUser()
    this.refreshTableItems()
    this.tablesAsOptions()
  },
  methods: {
    async refreshTableItems () {
      this.loading = true
      this.tableItems = await api.getElements('tableItems')
      this.loading = false
    },
    async tablesAsOptions () {
      const tables = await api.getElements('tables')
      this.tables = tables.filter(item => item.user === this.activeUser.sub)
      // this.tables = tables

      // Populate each table with key/value pairs that bootstrap form select knows
      this.tables.map(item => {
        item.value = item.id
        item.text = item.title
        return item
      })

      // Add default/empty option
      const defaultOption = { value: null, text: 'Please pick an option', disabled: true, skip: true }
      this.tables.unshift(defaultOption)
    },
    async populateTableItemToEdit (tableItem) {
      this.model = Object.assign({}, tableItem)

      const item = this.handleizeString(tableItem.title)
      const tableItemHTMLElement = document.querySelector(`[data-handle="${item}"]`)
      tableItemHTMLElement.classList.add('being-updated')
    },
    async saveTableItem () {
      if (this.model.id) {
        await api.updateElement('tableItems', this.model.id, this.model)
      } else {
        await api.createElement('tableItems', this.model)
      }
      this.model = { table: null } // reset form
      await this.refreshTableItems()

      const allHTMLElements = document.querySelectorAll('[data-handle]')
      for (var el of allHTMLElements) {
        el.classList.remove('being-updated')
      }
    },
    async deleteTableItem (id) {
      if (confirm('Are you sure you want to delete this tableItem?')) {
        // if we are editing a tableItem we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = { table: null }
        }
        await api.deleteElement('tableItems', id)
        await this.refreshTableItems()
      }
    },
    handleizeString (string) {
      return string.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '')
    }
  }
}
</script>

<style media="screen" lang="postcss" scroped>
  [data-handle] {
    transition: .3s all;
    --ggs: .75;
  }
  .being-updated {
    opacity: .5;
  }
</style>
