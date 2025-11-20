<script setup>
const items = [[
  { label: 'Dashboard', icon: 'lucide:layout-dashboard', to: '/admin/dashboard' },
  { label: 'Correspondence', icon: 'lucide:mail', to: '/admin/correspondence' },
  { label: 'Competencies', icon: 'lucide:lightbulb', children: [{ label: 'General', to: '/admin/competencies/general', icon: 'lucide:earth' }, { label: 'Specific', to: '/admin/competencies/specific', icon: 'lucide:school' }, { label: 'Suggestions', to: '/admin/competencies/suggestions', icon: 'lucide:messages-square' }] },
  { label: 'Documents', icon: 'lucide:file-edit', to: '/admin/documents' },
  { label: 'Administrator', icon: 'lucide:users-round', children: [{ label: 'Users', icon: 'lucide:user', to: '/admin/administrator/users' }, { label: 'Roles', icon: 'lucide:shield', to: '/admin/administrator/roles' }] }
  ],[
  { label: 'Feedback', icon: 'lucide:message-circle', to: '/admin/feedback'},
  { label: 'Help & Support', icon: 'lucide:help-circle', to: '/admin/help'},
]]

</script>

<template>
  <UDashboardSidebar collapsible resizable :ui="{'footer': 'border-t border-gray-300' }">
    <template #header="{ collapsed }">
      <img v-if="!collapsed" src="/logo.png" class="w-[75%] shrink-0" />
      <UIcon v-else name="i-simple-icons-nuxtdotjs" class="size-5 text-primary mx-auto" />
    </template>

    <template #default="{ collapsed }">
      <UButton :label="collapsed ? undefined : 'Search...'" icon="i-lucide-search" color="neutral" variant="outline"
        block :square="collapsed">
        <template v-if="!collapsed" #trailing>
          <div class="flex items-center gap-0.5 ms-auto">
            <UKbd value="meta" variant="subtle" />
            <UKbd value="K" variant="subtle" />
          </div>
        </template>
      </UButton>

      <UNavigationMenu :collapsed="collapsed" :items="items[0]" orientation="vertical" color="neutral" />

      <UNavigationMenu :collapsed="collapsed" :items="items[1]" orientation="vertical" color="neutral" class="mt-auto" />
    </template>

    <template #footer="{ collapsed }">
      <UButton
        :avatar="{ src: '/profile.jpg' }"
        :label="collapsed ? undefined : 'Napus Samuanpho'"
        color="neutral"
        variant="ghost"
        class="w-full"
        :block="collapsed"
      />
    </template>
  </UDashboardSidebar>
</template>