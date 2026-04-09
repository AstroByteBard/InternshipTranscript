<template>
  <CRow class="mb-4">
    <!-- Email Status -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" :style="emailReady ? 'background-color: #dcfce7;' : 'background-color: #fee2e2;'" style="width: 48px; height: 48px;">
              <CIcon :name="emailReady ? 'cil-check-circle' : 'cil-x-circle'" height="24" :style="emailReady ? 'color: #15803d;' : 'color: #b91c1c;'" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Email Status</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ emailReady ? 'Ready' : 'Not Ready' }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Pending -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #fffbeb; width: 48px; height: 48px;">
              <CIcon name="cil-clock" height="24" style="color: #d97706;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Pending</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ pending.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Sent / Replied -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #ecfdf5; width: 48px; height: 48px;">
              <CIcon name="cil-check-circle" height="24" style="color: #059669;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Sent / Replied</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ sent.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Failed / Closed -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #fef2f2; width: 48px; height: 48px;">
              <CIcon name="cil-warning" height="24" style="color: #dc2626;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Failed / Closed</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ failed.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'WidgetsCorrespondence',
  props: {
    emailReady: { type: Boolean, default: true },
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  }
}
</script>

<style scoped>
.rounded-circle {
  display: flex;
  align-items: center;
  justify-content: center;
}

.widget-card {
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  background-color: #ffffff;
}

.widget-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02) !important;
}
</style>
