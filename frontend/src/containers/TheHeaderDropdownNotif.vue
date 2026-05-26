<template>
  <CDropdown placement="bottom-end" :caret="false" in-nav class="c-header-nav-item d-md-down-none mx-2"
    add-menu-classes="pt-0">
    <template #toggler>
      <CHeaderNavLink>
        <CIcon name="cil-bell" />
        <CBadge shape="pill" color="danger">{{ itemsCount }}</CBadge>
      </CHeaderNavLink>
    </template>
    <CDropdownHeader tag="div" class="text-center bg-light">
      <strong>{{ $t('you_have_notifications', { count: itemsCount }) }}</strong>
    </CDropdownHeader>
    <CDropdownItem>
      <CIcon name="cil-user-follow" class="text-success" /> {{ $t('new_user_registered') }}
    </CDropdownItem>
    <CDropdownItem>
      <CIcon name="cil-user-unfollow" class="text-danger" /> {{ $t('user_deleted') }}
    </CDropdownItem>
    <CDropdownItem>
      <CIcon name="cil-chart-pie" class="text-info" /> {{ $t('sales_report_ready') }}
    </CDropdownItem>
    <CDropdownItem>
      <CIcon name="cil-basket" class="text-primary" /> {{ $t('new_client') }}
    </CDropdownItem>
    <CDropdownItem>
      <CIcon name="cil-speedometer" class="text-warning" /> {{ $t('server_overloaded') }}
    </CDropdownItem>
    <CDropdownHeader tag="div" class="text-center bg-light">
      <strong>{{ $t('server') }}</strong>
    </CDropdownHeader>
    <CDropdownItem class="d-block">
      <div class="text-uppercase mb-1">
        <small><b>{{ $t('cpu_usage') }}</b></small>
      </div>
      <CProgress class="progress-xs" color="info" :value="25" />
      <small class="text-muted">{{ $t('cpu_processes_cores') }}</small>
    </CDropdownItem>
    <CDropdownItem class="d-block">
      <div class="text-uppercase mb-1">
        <small><b>{{ $t('memory_usage') }}</b></small>
      </div>
      <CProgress class="progress-xs" color="warning" :value="70" />
      <small class="text-muted">{{ $t('memory_values') }}</small>
    </CDropdownItem>
    <CDropdownItem class="d-block">
      <div class="text-uppercase mb-1">
        <small><b>{{ $t('ssd_1_usage') }}</b></small>
      </div>
      <CProgress class="progress-xs" color="danger" :value="90" />
      <small class="text-muted">{{ $t('ssd_1_values') }}</small>
    </CDropdownItem>
  </CDropdown>
</template>
<script>
export default {
  name: 'TheHeaderDropdownNotif',
  data() {
    return { itemsCount: 5 }
  }
}
</script>

<style scoped>
.c-icon {
  margin-right: 0.3rem;
}
</style>