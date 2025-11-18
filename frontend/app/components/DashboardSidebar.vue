<script setup>
const links = [
  { label: 'Overview', icon: 'i-heroicons-home', to: '/dashboard' },
  { label: 'Users', icon: 'i-heroicons-user', to: '/dashboard/users' },
  { label: 'Reports', icon: 'i-heroicons-chart-bar', to: '/dashboard/reports' },
]
</script>

<template>
  <UDashboardSidebar :links="links" />
</template>