<template>
  <b-alert
    :show="content.show && !removeAlert"
    :variant="content.variant"
    class="d-flex align-items-center">
    <span class="alert__inner" :class="content.modifier" v-html="content.htmlContent"></span>
    <i @click.prevent='removeAlert = !removeAlert' class='gg-close ml-auto'></i>
  </b-alert>
</template>

<script>
export default {
  name: 'Alert',
  props: {
    content: {
        type: Object,
        required: true
    }
  },
  data() {
    return {
      removeAlert: false
    }
  }
}
</script>

<style lang="postcss" scoped>

</style>
