<template>
  <div id="app">
    <b-navbar toggleable="md" type="dark" variant="dark">
      <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
      <b-navbar-brand to="/" class="d-flex align-items-center"><i class="gg-pacman"></i> Master Refridgiator</b-navbar-brand>
      <b-collapse is-nav id="nav_collapse">
        <b-navbar-nav>
          <b-nav-item to="/fridge-stock">FridgeStock</b-nav-item>
          <b-nav-item to="/user" v-if="activeUser">{{ activeUser.given_name }}</b-nav-item>
          <b-nav-item href="#" @click.prevent="login" v-if="!activeUser">{{ prefferedLanguage.general.login }}</b-nav-item>
          <b-nav-item href="#" @click.prevent="logout" v-else>{{ prefferedLanguage.general.logout }}</b-nav-item>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>

    <transition
      name="fade"
      mode="out-in"
    >
      <router-view/>
    </transition>
  </div>
</template>

<script>
import Vue from 'vue'
import english from '@/locale/en.json'
import danish from '@/locale/da.json'
import api from '@/api'

export default {
  name: 'app',
  data () {
    return {
      activeUser: null,
      english: english,
      danish: danish,
      prefferedLanguage: english
    }
  },
  async created () {
    await this.refreshActiveUser()
    await this.setLanguage()
  },
  watch: {
    // everytime a route is changed refresh the activeUser
    '$route': 'refreshActiveUser'
  },
  methods: {
    login () {
      this.$auth.loginRedirect()
    },
    async refreshActiveUser () {
      this.activeUser = await this.$auth.getUser()
    },
    async logout () {
      await this.$auth.logout()
      await this.refreshActiveUser()
      if ( this.$route.path !== '/' ) {
        this.$router.push('/')
      } else {
        location.reload()
      }
    },
    async setLanguage () {
      this.prefferedLanguage = Vue.prototype.defaultPrefferedLanguage // set default preff lang from Vue instance
      if ( this.activeUser !== undefined ) {
        const dbUsers = await api.getElements('users') // get all users
        const currentUser = dbUsers.filter(item => item.sub === this.activeUser.sub) // get current user
        const shortenedLang = currentUser[0] ? (currentUser[0].lang ? currentUser[0].lang : 'en') : 'en' // if current user has set language, use it
        this.prefferedLanguage = shortenedLang === 'da' ? danish : english // set language from current user
        console.log(this.prefferedLanguage)
      }
    }
  }
}
</script>

<style media="screen" lang="postcss">
@import url('https://css.gg/c');

.fade-enter-active,
.fade-leave-active {
  transition-duration: 0.3s;
  transition-property: opacity;
  transition-timing-function: ease;
}

.fade-enter,
.fade-leave-active {
  opacity: 0
}

.help {
  color: #666;
}

.label-group {
  display: flex;
  flex-wrap: wrap;
}

.label-group .label {
  width: 100%;
}

</style>
