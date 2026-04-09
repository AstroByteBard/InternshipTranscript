<template>
    <div v-show="loadings">
      <div tabindex="-1" role="dialog" class="modal overflow-auto fade show d-block">
        <div role="document" class="modal-dialog modal-dialog-centered w-100">
          <div class="text-center w-100">
            <div role="status" aria-hidden="false" aria-label="Loading" class="spinner-border text-white mb-3" style="width: 4rem; height: 4rem;"></div>
            <div v-if="loadingMessage" class="loading-text text-white font-weight-bold h4 animate-pulse">
                {{ loadingMessage }}
            </div>
          </div>
        </div>
      </div>
      <div class="modal-backdrop fade show" style="background-color: rgba(0, 0, 0, 0.7); backdrop-filter: blur(4px);"></div>
    </div>
</template>

<script>

    import {mapGetters} from 'vuex'

    export default {
        name: 'CenterLoading',
        data: function () {
            return {
              // loadings: false
            }
        },
        mounted() {

        },

        created() {
        },

        beforeDestroy() {

        },

        methods: {},

        computed: {
            ...mapGetters({
                loadings: 'dialog/loading',
                loadingMessage: 'dialog/loadingMessage'
            })
        },

        watch: {

        }
    }
</script>

<style scoped>
.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}

.loading-text {
    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
    letter-spacing: 0.05em;
}
</style>
