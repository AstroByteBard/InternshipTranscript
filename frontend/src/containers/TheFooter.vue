<template>
  <CFooter :fixed="true">
    <div>
      <a href="https://coreui.io" target="_blank">{{ $t('coreui') }}</a>
      <span class="ml-1">&copy; {{ new Date().getFullYear() }} creativeLabs.</span>
    </div>
    <div class="ml-auto">
      <span class="mr-1" target="_blank">{{ $t('powered_by') }}</span>
      <a href="https://coreui.io/vue">{{ $t('coreui_for_vue') }}</a>
    </div>
  </CFooter>
</template>

<script>
export default {
  name: 'TheFooter'
}
</script>
