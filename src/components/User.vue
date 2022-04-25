<template>
  <article id="user" class="container">

    <section class="user-add-storage">
      <section class="route-title">
        <h1>{{ language.user.add_tables }}</h1>
        <p class="label" v-html="language.user.add_help"></p>
        <div class="route-title__examples examples">
          <p class="fat-label">{{ language.user.examples }}</p>
          <span class="example"
            v-for="(example, index) in help_examples"
            :key="index">
            {{ example }}
          </span>
        </div>
      </section>

      <article class="card">
        <form @submit.prevent="saveTable" class="add-table-form default-form">
          <label class="input" for="storage">
            <input class="focus-me" v-focus required type="text" v-model="model.title" id="storage">
            <span class="label">{{ language.user.form_placeholder }}</span>
          </label>
          <button class="button" type="submit" >{{ language.user.save_item }}</button>
        </form>
      </article>
    </section>

    <section class="user-list-storages" v-if="tables.length > 0">
      <section class="route-title">
        <h2>{{ language.user.your_tables}}</h2>
        <p class="label" v-html="language.user.your_tables_help"></p>
      </section>

      <section class="user-storages card">
        <ul>
          <li
            v-for="(table, index) in tables"
            :key="index"
            class="table-item">
            <h6 class="table-item__title" v-if="table !== editingItem" @dblclick="editItem(table)">{{ table.title }}</h6>
            <span class="actions">
              <a class="edit" href="#" @click="populateTableToEdit(table)" :title="language.user.edit"><EditIcon/></a>
              <a class="delete" href="#" @click.prevent="deleteTable(table.id)" :title="language.user.delete"><DeleteIcon/></a>
            </span>
            <div class="table-item__editing-state" v-if="table === editingItem" @keyup.enter="endEditing(table)" @blur="endEditing(table)">
              <input class="table-item__title editing" type="text" v-focus v-model="table.title">
              <span class="actions">
               <a class="save" href="#" @click.prevent="endEditing(table)"><CheckIcon/></a>
              </span>
            </div>
          </li>
        </ul>
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
    CheckIcon,
    DeleteIcon
  },
  data () {
    return {
      loading: false,
      tables: [],
      model: {},
      activeUser: null,
      language: this.$parent.prefferedLanguage,
      help_examples: [],
      editingItem: {}
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
      this.$parent.isNewUser = false
    },
    async deleteTable (id) {
      if (confirm('Are you sure you want to delete this table?')) {
        // if we are editing a table we deleted, remove it from the form
        if (this.model.id === id) {
          this.model = { user: this.activeUser.sub } // reset form
        }
        await api.deleteElement('tables', id)
        await this.getUserItems()

        if ( this.tables.length === 0 ) {
          this.$parent.isNewUser = true
        }
      }
    },
    async editItem (item) {
      this.editingItem = item
    },
    async endEditing (item) {
      await api.updateElement('tables', item.id, item)
      this.editingItem = {}
    }
  }
}
</script>

<style lang="scss" scoped>
  @import "@/assets/app.scss";
  @import "@/assets/components/_select.scss";
  @import "@/assets/components/_form.scss";
  @import "@/assets/components/_input.scss";
  @import "@/assets/components/_button.scss";
  @import "@/assets/components/_table-item.scss";

  #user {
    padding: $page-spacing;

    .examples {
      margin-top: 15px;

      .example {
        display: inline-flex;
        background-color: $col-primary--light;
        color: $col-primary;
        padding: 5px 8px;
        border-radius: 4px;
        margin: 2px 10px 2px 0;
      }
    }

    .card {
      max-width: 750px;
    }

    .add-table-form {
      .button {
        margin-top: 25px;
        margin-bottom: 25px;
      }
    }
  }
</style>

