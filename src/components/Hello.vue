<template>
  <div class="hero">
    <div>
      <h1 class="display-3"><span class="fat">Master Refridgiator</span> at your service!</h1>
      <p class="lead d-flex align-items-center justify-content-center">
        See more at <a class="d-flex align-items-center" target="_blank" href="https://github.com/Curzey/Fridge-Stock"><i class="gg-git-fork"></i> Github</a>
      </p>
      <section class="cta">
        <b-button v-if="activeUser !== undefined" :variant="isNewUser ? 'link' : 'primary'" to="/fridge-stock">Tilføj madvarer</b-button>
        <b-button v-if="activeUser !== undefined" :variant="!isNewUser ? 'link' : 'primary'" to="/user">Opret dit første table</b-button>
        <b-button v-else variant="primary" to="/user">Log in</b-button>
      </section>
    </div>
  </div>
</template>

<script>
import api from '@/api'

export default {
  data () {
    return {
      activeUser: null,
      isNewUser: true
    }
  },
  async created () {
    this.activeUser = await this.$auth.getUser()
    this.isNewUser = await this.updateIsNewUser()
  },
  methods: {
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

<style lang="postcss">
  .hero {
    height: 90vh;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
  }

  .hero .lead {
    font-weight: 200;
    font-size: 1.5rem;
  }

  .gg-git-fork {
    margin-left: 8px;
    margin-right: 10px;
  }

  .fat {
    font-weight: 600;
  }

  .cta {
    display: flex;
    justify-content: center;
    margin-top: 30px;
  }

  .cta .btn-link {
    order: 2;
  }
</style>
