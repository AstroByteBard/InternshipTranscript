<template>
  <CRow>
    <!-- Total Student -->
    <CCol sm="6" lg="4">
      <CCard class="border-0 shadow-sm rounded-lg" style="border-radius: 12px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="p-3 rounded-circle" style="background-color: #fee2e2;">
              <CIcon name="cil-graduation-cap" height="32" style="color: #b91c1c;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Total Student</div>
          <div class="h2 font-weight-bold mb-0 text-dark">1,245</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Total Evaluated -->
    <CCol sm="6" lg="4">
      <CCard class="border-0 shadow-sm rounded-lg" style="border-radius: 12px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="p-3 rounded-circle" style="background-color: #dcfce7;">
              <CIcon name="cil-check-circle" height="32" style="color: #15803d;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Total Evaluated</div>
          <div class="h2 font-weight-bold mb-0 text-dark">856</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Total Not Evaluated -->
    <CCol sm="6" lg="4">
      <CCard class="border-0 shadow-sm rounded-lg" style="border-radius: 12px;">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <div class="p-3 rounded-circle" style="background-color: #fee2e2;">
              <CIcon name="cil-x-circle" height="32" style="color: #b91c1c;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Total Not Evaluated</div>
          <div class="h2 font-weight-bold mb-0 text-dark">389</div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'WidgetsDropdown',
  data() {
    return {}
  }
}
</script>

<style scoped>
.rounded-circle {
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
