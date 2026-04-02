<template>
  <CRow class="mb-4 animate-fade-in-delayed">
    <!-- Total Students -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" :class="{'active-widget': activeTab === 'Student'}" @click="$emit('select-tab', 'Student')">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="icon-container bg-soft-red">
              <CIcon name="cil-people" height="20" class="text-danger" />
            </div>
            <div class="trend-indicator text-success small">
                <CIcon name="cil-arrow-top" size="sm" /> 12%
            </div>
          </div>
          <div class="widget-label">Total Students</div>
          <div class="widget-value">{{ studentCount.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Total Advisors -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card" :class="{'active-widget': activeTab === 'Advisor'}" @click="$emit('select-tab', 'Advisor')">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="icon-container bg-soft-orange">
              <CIcon name="cil-briefcase" height="20" class="text-warning" />
            </div>
          </div>
          <div class="widget-label">Total Advisors</div>
          <div class="widget-value">{{ advisorCount.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Total Schools -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="icon-container bg-soft-blue">
              <CIcon name="cil-bank" height="20" class="text-primary" />
            </div>
          </div>
          <div class="widget-label">Active Schools</div>
          <div class="widget-value">{{ schoolCount.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Total Programs -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="icon-container bg-soft-green">
              <CIcon name="cil-education" height="20" class="text-success" />
            </div>
          </div>
          <div class="widget-label">Academic Programs</div>
          <div class="widget-value">{{ programCount.toLocaleString() }}</div>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'WidgetsAdministrator',
  props: {
    studentCount: { type: Number, default: 0 },
    advisorCount: { type: Number, default: 0 },
    schoolCount: { type: Number, default: 0 },
    programCount: { type: Number, default: 0 },
    activeTab: { type: String, default: 'Student' }
  }
}
</script>

<style scoped>
.widget-card {
  border-radius: 20px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  background-color: #ffffff;
  border: 1px solid #f3f4f6 !important;
  height: 140px;
}

.widget-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.05), 0 10px 10px -5px rgba(0, 0, 0, 0.04) !important;
  border-color: #e5e7eb !important;
}

.active-widget {
  border: 2px solid #dc2626 !important;
  background-color: #fffafb;
}

.icon-container {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-soft-red { background-color: #fee2e2; }
.bg-soft-orange { background-color: #ffedd5; }
.bg-soft-blue { background-color: #e0f2fe; }
.bg-soft-green { background-color: #dcfce7; }

.widget-label {
  font-size: 11px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 4px;
}

.widget-value {
  font-size: 28px;
  font-weight: 800;
  color: #111827;
}

.animate-fade-in-delayed {
  animation: fadeIn 0.6s ease-out 0.2s forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
