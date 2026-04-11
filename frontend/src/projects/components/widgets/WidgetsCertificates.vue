<template>
  <CRow class="mb-4">
    <!-- Total Certificates -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #f8fafc; width: 48px; height: 48px;">
              <CIcon name="cil-school" height="24" style="color: #64748b;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Total Certificates</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ total.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Issued -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #ecfdf5; width: 48px; height: 48px;">
              <CIcon name="cil-check-circle" height="24" style="color: #059669;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Issued</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ issued.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Draft -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #fffbeb; width: 48px; height: 48px;">
              <CIcon name="cil-pencil" height="24" style="color: #d97706;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Draft</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ draft.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Revoked / Invalid -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #fef2f2; width: 48px; height: 48px;">
              <CIcon name="cil-shield-alt" height="24" style="color: #dc2626;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Revoked</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ revoked.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'WidgetsCertificates',
  props: {
    total: { type: Number, default: 0 },
    issued: { type: Number, default: 0 },
    draft: { type: Number, default: 0 },
    revoked: { type: Number, default: 0 }
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
