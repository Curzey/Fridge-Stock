<template>
  <article id="fridge-stock" class="container">
    <section class="route-title">
      <h1 v-html="(model.id ? language.fridgeStock.edit + ' ' + model.title : language.fridgeStock.new_item)"></h1>
      <p class="label" v-html="language.fridgeStock.helper"></p>
    </section>

    <article class="card" v-if="tables.length > 0">
      <form @submit.prevent="saveTableItem" class="add-item-form default-form">

        <label class="input" :for="language.fridgeStock.title">
          <input v-focus class="focus-me" required type="text" v-model="model.title" :id="language.fridgeStock.title">
          <span class="label">{{ language.fridgeStock.title }}</span>
        </label>
        
        <label class="input" :for="language.fridgeStock.qty">
          <input required type="text" v-model="model.qty" :id="language.fridgeStock.qty">
          <span class="label">{{ language.fridgeStock.qty }}</span>
        </label>

        <label class="input js-category-input" :for="language.fridgeStock.category">
          <input ref="categoryInput" required type="text" v-model="model.category" :id="language.fridgeStock.category">
          <span class="label">{{ language.fridgeStock.category }}</span>
        </label>

        <div class="examples">
          <p class="label">{{ language.fridgeStock.categories }}</p>
          <span class="example"
            v-for="(example, index) in categorizedTableItems"
            :key="index"
            @click="toggleCategoryExample(index)">
            {{ index }}
          </span>
        </div>

        <div class="select">
          <select class="select-text label" v-model="model.table" required>
            <option value="" disabled selected></option>
            <option v-for="(table, index) in tables" 
              :key="index" 
              :value="table.id">
              {{ table.title }}
            </option>
          </select>
          <span class="select-highlight"></span>
          <span class="select-bar"></span>
          <label class="select-label">{{ language.fridgeStock.table }}</label>
        </div>

        <button class="button" type="submit" >{{ language.fridgeStock.save }}</button>
      </form>
    </article>

    <article class="card" v-else>
      <h3>{{ language.fridgeStock.add_storage_units }}</h3>
      <router-link class="button" to="/user">{{ language.fridgeStock.add_storage_units_link }}</router-link>
    </article>

    <section class="tables">
      <section
        v-for="(table, index) in tables"
        :key="index"
        class="table">

        <header class="table-header"
          v-if="tableItems.filter(tableItem => tableItem.table === table.id).length > 0">
          <h2 class="has-counter">
            {{ table.title }}
            <div class="counter">
              {{ tableItems.filter(tableItem => tableItem.table === table.id).length }}
            </div>
          </h2>
        </header>

        <article v-for="(categories, index) in categorizedTableItems" 
          v-if="categories.filter(item => item.table === table.id).length > 0"
          :key="index"
          class="card">
          <ul>
            <h3 class="has-counter">
              {{ index }}
              <div class="counter">
                {{ categories.filter(item => item.table === table.id).length }}
              </div>
            </h3>
            <li
              v-for="(category, index) in
                categories
                  .filter(item => item.table === table.id)
                  .sort( dynamicSort('title') )"
              :key="index"
              :data-handle="handleizeString(category.title)"
              class="table-item">
              <h6 class="table-item__title" v-if="category !== editingItem" @dblclick="editItem(category)">{{ category.title }}</h6>
              <span class="table-item__qty" v-if="category !== editingItem" @dblclick="editItem(category)">{{ category.qty }}</span>
              <span class="actions" v-if="category !== editingItem">
                <a class="edit" href="#" @click="populateTableItemToEdit(category)" :title="language.fridgeStock.edit"><EditIcon/></a>
                <a class="delete" href="#" @click.prevent="deleteTableItem(category.id)" :title="language.fridgeStock.delete"><DeleteIcon/></a>
              </span>
              <div class="table-item__editing-state" v-if="category === editingItem" @keyup.enter="endEditing(category)" @blur="endEditing(category)">
                <input class="table-item__title editing" type="text" v-model="category.title">              
                <input class="table-item__qty editing" type="text" v-model="category.qty">
                <span class="actions">
                <a class="save" href="#" @click.prevent="endEditing(category)"><CheckIcon/></a>
                </span>
              </div>
            </li>
          </ul>
        </article>

      </section>
    </section>

  </article>
</template>

<script>
import api from '@/api'
import EditIcon from '@/components/EditIcon.vue'
import DeleteIcon from '@/components/DeleteIcon.vue'
import CheckIcon from '@/components/CheckIcon.vue'

export default {
  components: {
    EditIcon,
    DeleteIcon,
    CheckIcon
  },
  data () {
    return {
      tableItems: [],
      model: { table: null }, // initialize model with nulled table value for the default selected option in form
      tables: [],
      activeUser: null,
      language: this.$parent.prefferedLanguage,
      categorizedTableItems: {},
      categoryExampleUsed: false,
      editingItem: {}
		}
  },
  async created () {
    this.activeUser = await this.$auth.getUser()
    await this.getUserTables()
    await this.refreshTableItems()
    this.language = this.$parent.prefferedLanguage
    await this.categorizeTableItems()
  },
  methods: {
    async refreshTableItems () {
      const allTableItems = await api.getElements('tableItems')
      const allTableIds = this.tables.map(table => table.id)
      const userTableItems = allTableItems.filter(item => allTableIds.includes(item.table))
      this.tableItems = userTableItems
    },
    async getUserTables () {
      const tables = await api.getElements('tables')
      this.tables = tables.filter(item => item.user === this.activeUser.sub)
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
      if (confirm('Are you sure you want to delete this table?')) {
        // if we are editing a tableItem we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = { table: null }
        }
        await api.deleteElement('tableItems', id)
        await this.refreshTableItems()
        await this.categorizeTableItems()
      }
    },
    toggleCategoryExample (example) {
      if ( this.model.category === example ) {
        this.model.category = this.$refs.categoryInput.value
        this.categoryExampleUsed = false       
      } else {
        this.model.category = example
        this.$refs.categoryInput.value = example
        this.categoryExampleUsed = true
      }
    },
    handleizeString (string) {
      return string.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/-$/, '').replace(/^-/, '')
    },
    dynamicSort(property) {
      var sortOrder = 1

      if (property[0] === '-') {
        sortOrder = -1
        property = property.substr(1)
      }

      return function (a, b) {
        if (sortOrder === -1) {
          return b[property].localeCompare(a[property])
        } else {
          return a[property].localeCompare(b[property])
        }
      }
    },
    async editItem (item) {
      this.editingItem = item
    },
    async endEditing (item) {
      await api.updateElement('tableItems', item.id, item)
      this.editingItem = {}
    }
  }
}
</script>

<style media="screen" lang="scss" scoped>
  @import "@/assets/app.scss";
  @import "@/assets/components/_select.scss";
  @import "@/assets/components/_form.scss";
  @import "@/assets/components/_input.scss";
  @import "@/assets/components/_button.scss";
  @import "@/assets/components/_table-item.scss";
  
  #fridge-stock {
    padding: $page-spacing;

    .examples {
      margin-top: 15px;
      width: 100%;

      @media ( min-width: map-get($breakpoints, small) ) {
        width: calc(50% - #{$gut/2}) !important;
      }

      .example {
        display: inline-flex;
        background-color: $col-primary--light;
        color: $col-primary;
        padding: 5px 8px;
        border-radius: 4px;
        margin: 2px 10px 2px 0;
        cursor: pointer;
      }
    }

    .add-item-form {
      .button {
        margin-top: 25px;
        margin-bottom: 25px;
      }
    }

    .counter {
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 2px;
      border-radius: 100px;
      width: 15px;
      height: 15px;
      font-size: 1rem;
      color: $col-text;
    }

    .has-counter {
      display: flex;
      align-items: flex-start;
    }
  }

</style>
