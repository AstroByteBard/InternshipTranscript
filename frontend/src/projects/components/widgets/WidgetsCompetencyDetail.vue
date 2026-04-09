<template>
  <CRow class="mb-4">
    <!-- Total Items -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #eff6ff; width: 48px; height: 48px;">
              <CIcon name="cil-list" height="24" style="color: #3b82f6;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Total {{ itemName }}</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ totalItems.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Active Items -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #ecfdf5; width: 48px; height: 48px;">
              <CIcon name="cil-check-circle" height="24" style="color: #059669;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Active {{ itemName }}</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ activeItems.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Inactive Items -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #f8fafc; width: 48px; height: 48px;">
              <CIcon name="cil-ban" height="24" style="color: #64748b;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Inactive {{ itemName }}</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ inactiveItems.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Total Questions / Configurations -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #fffbeb; width: 48px; height: 48px;">
              <CIcon :name="questionIcon" height="24" style="color: #d97706;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Total {{ questionName }}</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ totalQuestions.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'WidgetsCompetencyDetail',
  props: {
    totalItems: { type: Number, default: 0 },
    activeItems: { type: Number, default: 0 },
    inactiveItems: { type: Number, default: 0 },
    totalQuestions: { type: Number, default: 0 },
    itemName: { type: String, default: 'Items' },
    questionName: { type: String, default: 'Questions' },
    questionIcon: { type: String, default: 'cil-task' }
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
