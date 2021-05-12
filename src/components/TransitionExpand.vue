<template>
  <transition
    name="expand"
    @enter="enter"
    @after-enter="afterEnter"
    @leave="leave"
  >
    <slot/>
  </transition>
</template>

<script>
  export default {
    name: 'TransitionExpand',
    methods: {
      enter(element) {
        const width = getComputedStyle(element).width

        element.style.width = width
        element.style.position = 'absolute'
        element.style.visibility = 'hidden'
        element.style.height = 'auto'

        const height = getComputedStyle(element).height

        element.style.width = null
        element.style.position = null
        element.style.visibility = null
        element.style.height = '25px'

        // Force repaint to make sure the
        // animation is triggered correctly.
        getComputedStyle(element).height

        // Trigger the animation.
        // We use `requestAnimationFrame` because we need
        // to make sure the browser has finished
        // painting after setting the `height`
        // to `0` in the line above.
        requestAnimationFrame(() => {
          element.style.height = height
        })
      },

      afterEnter(element) {
        element.style.height = 'auto'
      },

      leave(element) {
        const height = getComputedStyle(element).height
        
        element.style.height = height

        // Force repaint to make sure the
        // animation is triggered correctly.
        getComputedStyle(element).height

        requestAnimationFrame(() => {
          element.style.height = '25px'
        })
      }
    }
  }
</script>

<style scoped lang="scss">
  * {
    will-change: height;
    transform: translateZ(0);
    backface-visibility: hidden;
    perspective: 1000px;
  }

  .expand-enter-active,
  .expand-leave-active {
    transition: all .2s cubic-bezier(0.45, 0, 0.55, 1);;
    overflow: hidden;
  }

  .expand-enter,
  .expand-leave-to {
    height: 25px;
    opacity: 0;
  }
</style>

