<template>
  <article id="hello">
    <h1 class="app-title">
      Master Refridgiator 
      <span class="app-title--desc">at your service!</span>
    </h1>
    <HelloIllustration/>

    <div class="button-wrapper">
      <router-link class="button" to="/fridge-stock">{{ language.home.add_inventory}} </router-link>
      <router-link to="/user">{{ language.home.setup_storage }}</router-link>
    </div>
  </article>
</template>

<script>
import api from '@/api'
import Vue from 'vue'
import HelloIllustration from '@/components/HelloIllustration.vue'

export default {
  data () {
    return {
      language: this.$parent.prefferedLanguage
    }
  },
  components: {
    HelloIllustration
  },
  async created () {
    this.language = this.$parent.prefferedLanguage
  }
}
</script>

<style lang="scss">
  @import "@/assets/app.scss";
  @import "@/assets/components/_button.scss";

  #hello {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: $page-spacing;
    min-height: 100vh;

    svg {
      height: 200px;
      margin-top: 50px;
    }

    .app-title  {
      text-align: right;
      &--desc { display: block; }
    }

    .button-wrapper {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      margin-top: $gut;

      > * {
        margin: 5px;
      }
    }
  }
</style>
