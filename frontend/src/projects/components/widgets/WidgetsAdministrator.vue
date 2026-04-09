<template>
  <CRow class="mb-4 animate-fade-in-delayed">
    <!-- Card 1: Choose School -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle bg-soft-blue" style="width: 48px; height: 48px;">
              <CIcon name="cil-bank" height="24" class="text-primary" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">School</div>
          <div class="h2 font-weight-bold mb-0 text-dark text-truncate" :title="selectedSchool">{{ selectedSchool }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Card 2: Choose Major -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle bg-soft-green" style="width: 48px; height: 48px;">
              <CIcon name="cil-school" height="24" class="text-success" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">Major</div>
          <div class="h2 font-weight-bold mb-0 text-dark text-truncate" :title="selectedMajor">{{ selectedMajor }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Card 3: Choose ACADEMIC YEAR -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle bg-soft-orange" style="width: 48px; height: 48px;">
              <CIcon name="cil-calendar" height="24" style="color: #d97706;" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">ACADEMIC YEAR</div>
          <div class="h2 font-weight-bold mb-0 text-dark text-truncate" :title="selectedYear">{{ selectedYear }}</div>
        </CCardBody>
      </CCard>
    </CCol>

    <!-- Card 4: Total Students / Adviser -->
    <CCol sm="6" lg="3">
      <CCard class="border-0 shadow-sm rounded-lg widget-card"  
        @click="activeTab === 'Student' ? $router.push('/administrator/student') : $router.push('/administrator/adviser')">
        <CCardBody class="p-4">
          <div class="d-flex justify-content-between align-items-center mb-2">
            <div class="p-3 rounded-circle bg-soft-red" style="width: 48px; height: 48px;">
              <CIcon :name="activeTab === 'Student' ? 'cil-people' : 'cil-briefcase'" height="24" class="text-danger" />
            </div>
          </div>
          <div class="text-muted small text-uppercase font-weight-bold mb-1">
            {{ activeTab === 'Student' ? 'Total Students' : 'Total adviser' }}
          </div>
          <div class="h2 font-weight-bold mb-0 text-dark">
            {{ activeTab === 'Student' ? studentCount.toLocaleString() : advisorCount.toLocaleString() }}
          </div>
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
    selectedSchool: { type: String, default: 'ALL' },
    selectedMajor: { type: String, default: 'ALL' },
    selectedYear: { type: String, default: 'ALL' },
    activeTab: { type: String, default: 'Student' }
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
  background-color: #ffffff;
  height: 160px;
  overflow: hidden;
}

.widget-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02) !important;
}

.active-widget {
  border: 1.5px solid #dc2626 !important;
  background-color: #fffafb;
}

.bg-soft-red { background-color: #fee2e2; }
.bg-soft-orange { background-color: #ffedd5; }
.bg-soft-blue { background-color: #e0f2fe; }
.bg-soft-green { background-color: #dcfce7; }

.animate-fade-in-delayed {
  animation: fadeIn 0.6s ease-out 0.2s forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
