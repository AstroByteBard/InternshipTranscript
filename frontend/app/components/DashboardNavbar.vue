<script setup>
const props = defineProps({
  icon: {
    type: String,
    default: 'lucide:layout-dashboard'
  },
  title : {
    type: String,
    default: 'Dashboard Navbar'
  },
  subtitle: {
    type: String,
    default: 'Overview of student evaluation activity'
  }
});
</script>

<template>
  <UDashboardNavbar :ui="{ 'root' : 'py-10 border-b border-gray-300 w-full px-6 items-center justify-between' }">
    <template #left>
      <UButton :icon="props.icon" color="neutral" class="mr-2"/>
      <div>
        <h1 class="text-lg font-semibold">{{ props.title}}</h1>
        <p class="text-gray-500"> {{props.subtitle}}</p>
      </div>
    </template>
    <template #right>
      <slot name="actions" />
    </template>
  </UDashboardNavbar>
</template>
