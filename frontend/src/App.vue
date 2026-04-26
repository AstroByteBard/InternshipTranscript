<template>
  <router-view></router-view>
</template>

<script>
export default {
  name: 'App',
  created() {
    // Sync i18n locale with stored Vuex state on app startup
    const storeLang = this.$store.getters['setting/lang'];
    if (storeLang && this.$i18n) {
      this.$i18n.locale = storeLang;
    }
  }
}
</script>

<style lang="scss">
  // Import Main styles for this application
  @import 'assets/scss/style';
</style>
