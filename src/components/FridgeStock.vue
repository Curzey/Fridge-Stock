<template>
  <article id="fridge-stock" class="container">
    <section class="route-title" v-if="tables.length > 0">
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

    <article class="pilot" v-else>
      <section class="route-title">
        <h1>{{ language.fridgeStock.pilot.title }}</h1>
        <p class="label">{{ language.fridgeStock.pilot.helper }}</p>
        <router-link to="/user" class="button">{{ language.fridgeStock.pilot.add_your_first }}</router-link>
      </section>
      <span class="fat-label">Screenshot</span>
      <img class="pilot__desktop" src="@/assets/filled_app.png" alt="Screenshot of a filled app">
      <img class="pilot__mobile" src="@/assets/filled_app__mobile.png" alt="Screenshot of a filled app">      
    </article>

    <article class="no-inventory" v-if="tableItems.length === 0 && tables.length > 0">
      <p class="label">{{ language.fridgeStock.no_inventory }}</p>
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
            <div class="expander" @click.prevent="expandTable(table)">
              <span v-if="table.expanded" class="label">{{ language.general.fold }}</span>
              <span v-else class="label">{{ language.general.unfold }}</span>              
            </div>
          </h2>
        </header>

        <TransitionExpand>
          <article v-for="(categories, index) in categorizedTableItems" 
            v-if="categories.filter(item => item.table === table.id).length > 0 && table.expanded"
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
                v-for="category in
                  categories
                    .filter(item => item.table === table.id)
                    .sort( dynamicSort('title') )"
                :key="category.id"
                :data-handle="handleizeString(category.title)"
                class="table-item">
                <h6 class="table-item__title" v-if="category !== editingItem" @dblclick="editItem(category)">{{ category.title }}</h6>
                <span class="table-item__qty" v-if="category !== editingItem" @dblclick="editItem(category)">{{ category.qty }}</span>
                <span class="actions" v-if="category !== editingItem">
                  <a class="edit" href="#" @click="populateTableItemToEdit(category)" :title="language.fridgeStock.edit"><EditIcon/></a>
                  <a class="delete" href="#" @click.prevent="deleteTableItem(category.id)" :title="language.fridgeStock.delete"><DeleteIcon/></a>
                </span>
                <div class="table-item__editing-state" v-if="category === editingItem" @keyup.enter="endEditing(category)">
                  <input class="table-item__title editing" type="text" v-model="category.title">              
                  <input v-focus class="table-item__qty editing" type="text" v-model="category.qty">
                  <span class="actions">
                  <a class="save" href="#" @click.prevent="endEditing(category)"><CheckIcon/></a>
                  </span>
                </div>
              </li>
            </ul>
          </article>
        </TransitionExpand>
      </section>
    </section>

  </article>
</template>

<script>
import api from '@/api'
import EditIcon from '@/components/EditIcon.vue'
import DeleteIcon from '@/components/DeleteIcon.vue'
import CheckIcon from '@/components/CheckIcon.vue'
import TransitionExpand from '@/components/TransitionExpand'

export default {
  components: {
    EditIcon,
    DeleteIcon,
    CheckIcon,
    TransitionExpand
  },
  data () {
    return {
      tableItems: [],
      model: { table: null }, 
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
    expandTable (table) {
      table.expanded = !table.expanded
    },
    async refreshTableItems () {
      const allTableItems = await api.getElements('tableItems')
      const allTableIds = this.tables.map(table => table.id)
      const userTableItems = allTableItems.filter(item => allTableIds.includes(item.table))
      this.tableItems = userTableItems
    },
    async getUserTables () {
      const tables = await api.getElements('tables')

      for (const table of tables) { 
        table.expanded = true 
      }

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
  @import "@/assets/components/_pilot.scss";
  
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

    .no-inventory {
      box-shadow: rgba(0,0,0,.16) 0px 1px 3px;
      background-color: #effcff;
      padding: $gutter;
      border-radius: 10px;
    }

    .expander {
      font-size: 1rem;
      margin-left: auto;
      font-weight: 400;
      display: inline-flex;
      margin-top: auto;
      cursor: pointer;
      user-select: none;
    }
  }

</style>
