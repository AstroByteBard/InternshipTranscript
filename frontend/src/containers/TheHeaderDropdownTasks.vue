<template>
  <CDropdown :caret="false" placement="bottom-end" in-nav class="c-header-nav-item d-md-down-none mx-2"
    add-menu-classes="pt-0">
    <template #toggler>
      <CHeaderNavLink>
        <CIcon name="cil-list-rich" />
        <CBadge shape="pill" color="warning">{{ itemsCount }}</CBadge>
      </CHeaderNavLink>
    </template>
    <CDropdownHeader tag="div" class="text-center bg-light">
      <strong>{{ $t('you_have_pending_tasks', { count: itemsCount }) }}</strong>
    </CDropdownHeader>

    <CDropdownItem class="d-block">
      <div class="small mb-1">
        {{ $t('upgrade_npm_bower') }} <span class="float-right"><strong>0%</strong></span>
      </div>
      <CProgress class="progress-xs" color="info" />
    </CDropdownItem>

    <CDropdownItem class="d-block">
      <div class="small mb-1">
        {{ $t('reactjs_version') }} <span class="float-right"><strong>25%</strong></span>
      </div>
      <CProgress class="progress-xs" color="danger" :value="25" />
    </CDropdownItem>

    <CDropdownItem class="d-block">
      <div class="small mb-1">
        {{ $t('vuejs_version') }} <span class="float-right"><strong>50%</strong></span>
      </div>
      <CProgress class="progress-xs" color="warning" :value="50" />
    </CDropdownItem>

    <CDropdownItem class="d-block">
      <div class="small mb-1">
        {{ $t('add_new_layouts') }} <span class="float-right"><strong>75%</strong></span>
      </div>
      <CProgress class="progress-xs" color="info" :value="75" />
    </CDropdownItem>

    <CDropdownItem class="d-block">
      <div class="small mb-1">
        {{ $t('angular_2_cli_version') }} <span class="float-right"><strong>100%</strong></span>
      </div>
      <CProgress class="progress-xs" color="success" :value="100" />
    </CDropdownItem>

    <CDropdownItem class="text-center border-top">
      <strong>{{ $t('view_all_tasks') }}</strong>
    </CDropdownItem>

  </CDropdown>
</template>
<script>
export default {
  name: 'TheHeaderDropdownTasks',
  data() {
    return { itemsCount: 15 }
  }
}
</script>
