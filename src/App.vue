<template>
  <div id="app">
    <div class="container">
        <nav class="main-nav"> 
          <router-link to="/"><HomeIcon/></router-link>
          <router-link to="/fridge-stock" class="link-no-deco"><span class="fat-label primary">{{ prefferedLanguage.layout.my_storages }}</span></router-link>
          <div class="main-nav__settings">
            <a class="lang-picker" href="#" v-if="prefferedLanguage === english" @click.prevent="setLanguage('Danish', true)">da</a>
            <a class="lang-picker" href="#" v-else @click.prevent="setLanguage('English', true)">en</a>          
            <router-link to="/user"><SettingsIcon/></router-link>
          </div>
        </nav>
    </div>

    <transition
      name="fade"
      mode="out-in"
    >
      <router-view/>
    </transition>

    <button class="floating-add" ref="floating-add" @click.prevent="handleFloatingAdd()">
      <router-link v-if="!isNewUser" to="/fridge-stock"><i class="gg-math-plus"></i></router-link>
      <router-link v-else to="/user"><i class="gg-math-plus"></i></router-link>
    </button>

  </div>
</template>

<script>
import Vue from 'vue'
import english from '@/locale/en.json'
import danish from '@/locale/da.json'
import api from '@/api'
import HomeIcon from '@/components/HomeIcon.vue'
import SettingsIcon from '@/components/SettingsIcon.vue'
import Cookies from 'js-cookie'

export default {
  name: 'app',
  data () {
    return {
      activeUser: null,
      english: english,
      danish: danish,
      prefferedLanguage: danish,
      isNewUser: true
    }
  },
  components: {
    HomeIcon,
    SettingsIcon
  },
  async created () {
    await this.refreshActiveUser()
    await this.setLanguage(Cookies.get('clientLang'), false)
    this.isNewUser = await this.updateIsNewUser()
  },
  watch: {
    // everytime a route is changed refresh the activeUser
    '$route': 'refreshActiveUser'
  },
  methods: {
    handleFloatingAdd() {
      if ( this.$route.name === 'FridgeStock' || this.$route.name === 'User' ) {
        document.querySelector('.focus-me').focus()
      }
    },
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
    async setLanguage (lang, reload) {
      this.prefferedLanguage = danish.title === lang ? danish : english
      Cookies.set('clientLang', lang)
      if (reload) { location.reload() }
    },
    async updateIsNewUser () {
      if ( this.activeUser !== undefined ) {
        const tables = await api.getElements('tables')
        const userTables = tables.filter(item => item.user === this.activeUser.sub)
        return userTables.length <= 0
      }
    }
  }
}
</script>

<style media="screen" lang="scss">
  @import url('https://css.gg/c');
  @import "@/assets/reset.scss";
  @import "@/assets/app.scss";

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

  body {
    background: $app-bg;
  }

  .container {
    max-width: $container-size;
    margin: 0 auto;
    position: relative;
  }

  .main-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: $default-spacing;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    z-index: 5;

    svg {
      stroke: $col-primary; 
    }

    &__settings {
      display: flex;
      align-items: center;

      .lang-picker {
        @extend .fat-label;
        @extend .primary;
        @extend .link-no-deco;
        text-transform: uppercase;
        margin-right: 10px;
      }
    }
  }

  button {
    border: none;
    background: none;
    &:focus { outline: none; }
  }

  .floating-add {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: -6px;
    background-color: #fff;
    width: 60px;
    height: 50px;
    border-top-left-radius: 50%;
    border-top-right-radius: 50%;
    box-shadow: rgba(0,0,0,.16) 0 -1px 4px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: $col-primary;

    --ggs: 0.85;
    > a { color: inherit; }
  }

  .card {
    background-color: #fff;
    border-radius: 10px;
    box-shadow: rgba(0,0,0,.16) 0px 3px 6px;
    padding: $gutter;
    margin-bottom: 30px;
  }

  .route-title {
    margin-bottom: $default-spacing;
    max-width: 600px;
  }

  .tables {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;

    .table {
      width: 100%;

      @media ( min-width: map-get($breakpoints, medium) ) {
        width: calc(50% - 30px);
      }

      @media ( min-width: map-get($breakpoints, content) ) {
        width: calc(33.33% - 30px);
      }
    }
  }

</style>
