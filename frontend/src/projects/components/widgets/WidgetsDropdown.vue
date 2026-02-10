<template>
  <CRow>
    <CCol sm="6" lg="4">
      <CCard>
        <CCardBody class="d-flex justify-content-between align-items-start">
          <div>
            <div class="text-volume">Total Students</div>
            <div class="text-value-lg mt-2">4000</div>
          </div>
          <CIcon name="cil-people" height="24" class="text-info" />
        </CCardBody>
      </CCard>
    </CCol>
    <CCol sm="6" lg="4">
      <CCard>
        <CCardBody class="d-flex justify-content-between align-items-start">
          <div>
            <div class="text-volume">Evaluated</div>
            <div class="text-value-lg mt-2">2500</div>
          </div>
          <CIcon name="cil-user-follow" height="24" class="text-success" />
        </CCardBody>
      </CCard>
    </CCol>
    <CCol sm="6" lg="4">
      <CCard>
        <CCardBody class="d-flex justify-content-between align-items-start">
          <div>
            <div class="text-volume">Not Evaluated</div>
            <div class="text-value-lg mt-2">1500</div>
          </div>
          <CIcon name="cil-user-unfollow" height="24" class="text-danger" />
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
.text-volume {
  font-size: 0.875rem;
  font-weight: 500;
  color: #3c4b64;
}

.text-value-lg {
  font-size: 2.5rem;
  font-weight: 500;
}
</style>
