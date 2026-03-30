<template>
  <CRow>
    <!-- Selected School -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px; background-color: #f0f9ff;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #e0f2fe; width: 48px; height: 48px;">
              <CIcon name="cil-bank" height="24" style="color: #0369a1;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Selected School</div>
          <div class="h5 font-weight-bold mb-0 text-dark text-truncate" :title="schoolName">
            {{ schoolName }}
          </div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Total Student -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;" @click="$emit('filter-status', 'all')">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #fee2e2; width: 48px; height: 48px;">
              <CIcon name="cilPeople" height="24" style="color: #b91c1c;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Total Student</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ total.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Total Evaluated -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;" @click="$emit('filter-status', 'evaluated')">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #dcfce7; width: 48px; height: 48px;">
              <CIcon name="cil-check-circle" height="24" style="color: #15803d;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Total Evaluated</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ evaluated.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Total Not Evaluated -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" style="height: 160px;" @click="$emit('filter-status', 'not_evaluated')">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle" style="background-color: #fee2e2; width: 48px; height: 48px;">
              <CIcon name="cil-x-circle" height="24" style="color: #b91c1c;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Total Not Evaluated</div>
          <div class="h2 font-weight-bold mb-0 text-dark">{{ notEvaluated.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'WidgetsDashboard',
  props: {
    schoolName: {
      type: String,
      default: 'All Schools'
    },
    total: {
      type: Number,
      default: 0
    },
    evaluated: {
      type: Number,
      default: 0
    },
    notEvaluated: {
      type: Number,
      default: 0
    }
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
  cursor: pointer;
}

.widget-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05) !important;
}
</style>


