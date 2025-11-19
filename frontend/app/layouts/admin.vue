<script setup>
const pageIcon = useState("pageIcon")
const pageTitle = useState("pageTitle")
const pageSubtitle = useState("pageSubtitle")
</script>

<template>
  <UDashboardGroup class="min-w-screen ">
    <DashboardSidebar class="min-h-screen" />

    <div class="flex-1 w-full">
      <DashboardNavbar :title="pageTitle" :subtitle="pageSubtitle" :icon="pageIcon" >
        <template #actions>
          <slot name="navbar-sub-actions" />
          <slot name="navbar-actions" />
        </template>
      </DashboardNavbar>
      <UDashboardPanel class="px-6 py-5 min-h-screen">
        <slot />
      </UDashboardPanel>
    </div>
  </UDashboardGroup>
</template>
