<template>
  <div>
    <div class="d-flex justify-content-end  mb-4">
      <CButton color="danger" class="px-4 text-white font-weight-bold"
        style="background-color: #b91c1c; border-color: #b91c1c;">
        Download Report
      </CButton>
    </div>

    <CCard class="rounded shadow-sm mb-4">
      <CCardBody class="p-3">
      <CRow>
        <CCol md="4">
          <CSelect custom class="mb-0" placeholder="All Schools">
            <option value="" disabled selected>All Schools</option>
            <option value="1">School of IT</option>
            <option value="2">School of Management</option>
          </CSelect>
        </CCol>
        <CCol md="4">
          <CSelect custom class="mb-0" placeholder="All Programs">
            <option value="" disabled selected>All Programs</option>
            <option value="1">Software Engineering</option>
            <option value="2">Business Administration</option>
          </CSelect>
        </CCol>
        <CCol md="4">
          <CSelect custom class="mb-0" placeholder="Year">
            <option value="2024">2023-2024</option>
            <option value="2023">2022-2023</option>
          </CSelect>
        </CCol>
      </CRow>
    </CCardBody>
    </CCard>

    <WidgetsDropdown />
    <CRow>
      <CCol md="8">
        <CChartBar />
      </CCol>
      <CCol md="4">
        <CChartPie />
      </CCol>
    </CRow>
    <CChartLine />
  </div>
</template>

<script>
import WidgetsDropdown from '../components/widgets/WidgetsDropdown.vue'
import CChartBar from '../components/charts/CChartBar'
import CChartPie from '../components/charts/CChartPie'
import CChartLine from '../components/charts/CChartLine'

export default {
  name: 'Dashboard',
  components: {
    WidgetsDropdown,
    CChartBar,
    CChartPie,
    CChartLine
  },
  data() {
    return {

    }
  },
  mounted() {
    this.onInit()
  },
  methods: {
    onInit() {
      this.$store.dispatch("administrator/student")
    }
  }
}
</script>
