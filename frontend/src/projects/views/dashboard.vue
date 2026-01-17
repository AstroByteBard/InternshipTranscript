<template>
  <div>
    <WidgetsDropdown />
    <CCard>
      <CCardBody>
        <CRow>
          <CCol sm="5">
            <h4 id="traffic" class="card-title mb-0"> ADD SOME TEXT </h4>
            <div class="small text-muted">ADD SOME TEXT</div>
          </CCol>
          <CCol sm="7" class="d-none d-md-block">
            <CButton color="primary" class="float-right">
              <CIcon name="cil-cloud-download" />
            </CButton>
            <CButtonGroup class="float-right mr-3">
              <CButton color="outline-secondary" v-for="(value, key) in ['Day', 'Month', 'Year']" :key="key"
                class="mx-0" :pressed="value === selected ? true : false" @click="selected = value">
                {{ value }}
              </CButton>
            </CButtonGroup>
          </CCol>
        </CRow>
        <MainChartExample style="height:300px;margin-top:40px;" />
      </CCardBody>
      <CCardFooter>
        <CRow class="text-center">
          <CCol md sm="12" class="mb-sm-2 mb-0">
            <div class="text-muted">Semester</div>
            <strong>1</strong>
            <CProgress
              class="progress-xs mt-2"
              :precision="1"
              color="warning" 
              :value="100"
            />
          </CCol>
          <CCol md sm="12" class="mb-sm-2 mb-0 d-md-down-none">
            <div class="text-muted">Student</div>
            <strong>4000 User (100%)</strong>
            <CProgress
              class="progress-xs mt-2"
              :precision="1"
              color="info"
              :value="100"
            />
          </CCol>
          <CCol md sm="12" class="mb-sm-2 mb-0 d-md-down-none">
            <div class="text-muted">Advice</div>
            <strong>1500 User (100%)</strong>
            <CProgress
              class="progress-xs mt-2"
              :precision="1"
              :value="100"
            />
          </CCol>
          <CCol md sm="12" class="mb-sm-2 mb-0">
            <div class="text-muted">Evaluated</div>
            <strong>2500 Users (70%)</strong>
            <CProgress
              class="progress-xs mt-2"
              :precision="1"
              color="success"
              :value="70"
            />
          </CCol>
          <CCol md sm="12" class="mb-sm-2 mb-0">
            <div class="text-muted">Not Evaluated</div>
            <strong>1500 Users (30%)</strong>
            <CProgress
              class="progress-xs mt-2"
              :precision="1"
              color="danger"
              :value="30"
            />
          </CCol>
        </CRow>
      </CCardFooter>
    </CCard>
  </div>
</template>

<script>
import WidgetsDropdown from './widgets/WidgetsDropdown'
import MainChartExample from './charts/MainChartExample'

export default {
  name: 'dashboard',
  components: {
    WidgetsDropdown,
    MainChartExample
  },
  data() {
    return {

    }
  },

  mounted() {

  },

  created() {
    this.onInit();
  },

  beforeDestroy() {

  },

  methods: {
    onInit() {

    },


  },

  computed: {

  },

  watch: {

  }
}

</script>