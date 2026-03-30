<template>
  <CRow class="mb-4">
    <!-- Total Communication -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card total-card" style="height: 140px;">
        <CCardBody class="p-4 d-flex flex-column justify-content-between">
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted small text-uppercase font-weight-bold">Total Communication</div>
            <div class="p-2 rounded-lg bg-light-blue text-blue">
              <CIcon name="cil-envelope-closed" height="18" />
            </div>
          </div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ total.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Pending -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card pending-card" style="height: 140px;">
        <CCardBody class="p-4 d-flex flex-column justify-content-between">
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted small text-uppercase font-weight-bold">Pending</div>
            <div class="p-2 rounded-lg bg-light-yellow text-yellow">
              <CIcon name="cil-clock" height="18" />
            </div>
          </div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ pending.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Sent / Replied -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card sent-card" style="height: 140px;">
        <CCardBody class="p-4 d-flex flex-column justify-content-between">
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted small text-uppercase font-weight-bold">Sent / Replied</div>
            <div class="p-2 rounded-lg bg-light-green text-green">
              <CIcon name="cil-check-circle" height="18" />
            </div>
          </div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ sent.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Failed / Closed -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card failed-card" style="height: 140px;">
        <CCardBody class="p-4 d-flex flex-column justify-content-between">
          <div class="d-flex justify-content-between align-items-center">
            <div class="text-muted small text-uppercase font-weight-bold">Failed / Closed</div>
            <div class="p-2 rounded-lg bg-light-red text-red">
              <CIcon name="cil-warning" height="18" />
            </div>
          </div>
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
    total: { type: Number, default: 0 },
    pending: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    failed: { type: Number, default: 0 }
  }
}
</script>

<style scoped>
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

/* Accent borders */
.total-card   { border-bottom: 4px solid #3b82f6 !important; }
.pending-card { border-bottom: 4px solid #f59e0b !important; }
.sent-card    { border-bottom: 4px solid #10b981 !important; }
.failed-card  { border-bottom: 4px solid #ef4444 !important; }

/* Icon Backgrounds */
.bg-light-blue { background-color: #eff6ff; }
.bg-light-yellow { background-color: #fffbeb; }
.bg-light-green { background-color: #ecfdf5; }
.bg-light-red { background-color: #fef2f2; }

/* Icon Colors */
.text-blue { color: #2563eb; }
.text-yellow { color: #d97706; }
.text-green { color: #059669; }
.text-red { color: #dc2626; }
</style>
