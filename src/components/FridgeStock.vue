<template>
  <div class="container-fluid mt-4">
    <h1 class="h1 mt-5 mb-4">What's in my fridge?</h1>
    <b-alert :show="loading" class="d-flex align-items-center" variant="info"><i class="gg-spinner mr-2"></i> Loading... </b-alert>

    <b-jumbotron v-if="tables.length > 1" :lead="(model.id ? language.fridgeStock.edit + ' ' + model.title : language.fridgeStock.new_item)">
      <b-form inline @submit.prevent="saveTableItem">
        <label class="sr-only" for="inline-form-input-title">{{ language.fridgeStock.title }}</label>
        <b-input-group prepend="<i class='gg-chevron-double-right'></i>" class="mb-2 mr-sm-2">
          <b-input v-model="model.title" id="inline-form-input-title" required :placeholder="language.fridgeStock.title"></b-input>
        </b-input-group>

        <label class="sr-only" for="inline-form-input-quantity">{{ language.fridgeStock.qty }}</label>
        <b-input-group prepend="<i class='gg-infinity'></i>" class="mb-2 mr-sm-2">
          <b-input type="number" step="0.01" min="0" max="" v-model="model.qty" id="inline-form-input-quantity" :placeholder="language.fridgeStock.qty"></b-input>
        </b-input-group>

        <label class="sr-only" for="inline-form-input-unit">{{ language.fridgeStock.unit }}</label>
        <b-input-group prepend="<i class='gg-gym'></i>" class="mb-2 mr-sm-2">
          <b-input v-model="model.unit" id="inline-form-input-unit" :placeholder="language.fridgeStock.unit"></b-input>
        </b-input-group>

        <label class="sr-only" for="inline-form-input-category">{{ language.fridgeStock.category }}</label>
        <b-input-group prepend="<i class='gg-qr'></i>" class="mb-2 mr-sm-2">
          <b-input v-model="model.category" required id="inline-form-input-category" :placeholder="language.fridgeStock.category"></b-input>
        </b-input-group>

        <label class="sr-only" for="inline-form-input-table">{{ language.fridgeStock.table }}</label>
        <b-input-group prepend="<i class='gg-row-first'></i>" class="mb-2 mr-sm-2">
          <b-form-select required v-model="model.table" :options="tables"></b-form-select>
        </b-input-group>

        <b-button type="submit" class="mb-2" variant="primary">{{ language.fridgeStock.save }}</b-button>
      </b-form>
    </b-jumbotron>

    <b-jumbotron v-else :lead="language.fridgeStock.add_storage_units">
      <b-button to="/user" type="submit" variant="primary">{{ language.fridgeStock.add_storage_units_link }}</b-button>
    </b-jumbotron>

    <b-row>
      <b-col>
        <b-card-group columns>
  				<b-card
            :header="table.title"
  					v-for="(table, index) in tables.filter(table => !table.skip)"
  					:key="index"
            class="mb-3">

  					<b-alert
  						:show="tableItems.filter(tableItem => tableItem.table === table.id).length === 0"
  						variant="warning">

  						{{ table.title }} {{ language.fridgeStock.is_all_empty}}
  					</b-alert>

            <div v-for="(categories, index) in categorizedTableItems" :key="index">
              <div v-if="categories.filter(item => item.table === table.id).length > 0" class="mb-4">
                <div class="d-flex align-items-center mb-2">
                  <h4 class="d-flex align-items-center mb-0 mr-2"><i class="gg-bowl mr-2"></i> {{ index }}</h4>
                  <b-badge pill variant="info">
                    {{ categories.filter(item => item.table === table.id).length }}
                  </b-badge>
                </div>
                <b-list-group
                  v-for="(category, index) in categories.filter(item => item.table === table.id)"
                  :key="index"
                  :data-handle="handleizeString(category.title)">
                  <b-list-group-item class="mb-1 d-flex align-items-center">
                    <h6 class="mb-0 mr-3">{{ category.title }}</h6>
                    <b-badge class="m-1 d-inline-flex align-items-center" pill variant="light">x{{ category.qty }} {{ category.unit }}</span></b-badge>
                    <b-button-group size="sm" class="ml-auto">
                      <a class="btn btn-info" href="#" variant="info" @click="populateTableItemToEdit(category)">{{ language.fridgeStock.edit }}</a>
                      <a class="btn btn-warning" href="#" variant="warning" @click="deleteTableItem(category.id)">{{ language.fridgeStock.delete }}</a>
                    </b-button-group>
                  </b-list-group-item>
                </b-list-group>
              </div>
            </div>

  				</b-card>
        </b-card-group>
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
      activeUser: null,
      language: this.$parent.prefferedLanguage,
      categorizedTableItems: {}
		}
  },
  async created () {
    this.activeUser = await this.$auth.getUser()
    this.refreshTableItems()
    this.tablesAsOptions()
    this.language = this.$parent.prefferedLanguage
    await this.categorizeTableItems()
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

      // Populate each table with key/value pairs that bootstrap form select knows
      this.tables.map(item => {
        item.value = item.id
        item.text = item.title
        return item
      })

      // Add default/empty option
      const defaultOption = { value: null, text: this.language.fridgeStock.table, disabled: true, skip: true }
      this.tables.unshift(defaultOption)
    },
    async categorizeTableItems () {
      await this.refreshTableItems()

      const categories = {}
      this.tableItems.forEach(el => {
        if (categories[el.category]) {
          categories[el.category].push(el)
        } else {
          categories[el.category] = [el]
        }
      })
      console.log(categories)
      this.categorizedTableItems = categories
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
      await this.categorizeTableItems()
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
        await this.categorizeTableItems()
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
  .input-group-text {
    width: 50px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .input-group {
    min-width: 250px;
    max-width: 100%;
  }
  .card-columns {
    column-count: 1;
  }
  @media (min-width: 768px) {
    .card-columns {
      column-count: 2;
    }
  }
  @media (min-width: 1366px) {
    .card-columns {
      column-count: 3;
    }
  }
</style>
