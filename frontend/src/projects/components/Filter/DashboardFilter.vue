<template>
  <CRow>
    <CCol md="12">
      <CCard class="dashboard-filter-card border-0 mb-4">
        <CCardBody class="p-0">
          <CRow class="align-items-center m-0">
            <!-- School Filter -->
            <CCol md="3" class="filter-col px-4 py-3">
              <div class="filter-item">
                <div class="filter-header">
                  <CIcon name="cil-bank" class="filter-icon school-icon" />
                  <span class="filter-label">School</span>
                </div>
                <slot name="school">
                  <CSelect 
                    custom 
                    class="mb-0 modern-select" 
                    :options="schoolOptions" 
                    :value="school"
                    @update:value="$emit('update:school', $event)"
                  />
                </slot>
              </div>
            </CCol>

            <!-- Program Filter -->
            <CCol md="3" class="filter-col px-4 py-3">
              <div class="filter-item">
                <div class="filter-header">
                  <CIcon name="cil-list-rich" class="filter-icon program-icon" />
                  <span class="filter-label">Program</span>
                </div>
                <slot name="program">
                  <CSelect 
                    custom 
                    class="mb-0 modern-select" 
                    :options="programOptions" 
                    :value="program"
                    @update:value="$emit('update:program', $event)"
                  />
                </slot>
              </div>
            </CCol>

            <!-- Academic Year Filter -->
            <CCol md="3" class="filter-col px-4 py-3">
              <div class="filter-item">
                <div class="filter-header">
                  <CIcon name="cil-calendar" class="filter-icon year-icon" />
                  <span class="filter-label">Academic Year</span>
                </div>
                <slot name="year">
                  <CSelect 
                    custom 
                    class="mb-0 modern-select" 
                    :options="yearOptions" 
                    :value="year"
                    @update:value="$emit('update:year', $event)"
                  />
                </slot>
              </div>
            </CCol>

            <!-- Evaluation Filter -->
            <CCol md="3" class="filter-col px-4 py-3">
              <div class="filter-item">
                <div class="filter-header">
                  <CIcon name="cil-chart-pie" class="filter-icon evaluated-icon" />
                  <span class="filter-label">Status</span>
                </div>
                <slot name="evaluated">
                  <CSelect 
                    custom 
                    class="mb-0 modern-select" 
                    :options="evaluatedOptions" 
                    :value="evaluated"
                    @update:value="$emit('update:evaluated', $event)"
                  />
                </slot>
              </div>
            </CCol>
          </CRow>
        </CCardBody>
      </CCard>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'DashboardFilter',
  props: {
    school: { type: String, default: '' },
    program: { type: String, default: '' },
    year: { type: String, default: '' },
    evaluated: { type: String, default: '' },
    schoolOptions: { type: Array, default: () => [] },
    programOptions: { type: Array, default: () => [] },
    yearOptions: { type: Array, default: () => [] },
    evaluatedOptions: { type: Array, default: () => [] }
  }
}
</script>

<style scoped>
.dashboard-filter-card {
  background: rgba(255, 255, 255, 0.8) !important;
  backdrop-filter: blur(10px);
  border-radius: 16px !important;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05) !important;
  border: 1px solid rgba(255, 255, 255, 0.5) !important;
}

.filter-col {
  border-right: 1px solid #f1f5f9;
}

.filter-col:last-child {
  border-right: none;
}

.filter-item {
  padding: 0;
}

.filter-header {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
}

.filter-icon {
  width: 14px;
  height: 14px;
  margin-right: 8px;
}

.school-icon { color: #0369a1; }
.program-icon { color: #7c3aed; }
.year-icon { color: #ea580c; }
.evaluated-icon { color: #16a34a; }

.filter-label {
  font-size: 11px;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.modern-select {
  border-radius: 10px !important;
  border: 1.5px solid #f1f5f9 !important;
  background-color: #ffffff !important;
  color: #1e293b !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  height: 44px !important;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  cursor: pointer !important;
  padding-left: 12px !important;
}

.modern-select:hover {
  border-color: #cbd5e1 !important;
  background-color: #f8fafc !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05) !important;
}

.modern-select:focus {
  border-color: #c83f36 !important;
  box-shadow: 0 0 0 4px rgba(200, 63, 54, 0.1) !important;
  background-color: #ffffff !important;
}

/* Specific select styling to override CoreUI defaults */
::v-deep .modern-select select {
  border: none !important;
  background-color: transparent !important;
  padding: 0 !important;
  font-weight: inherit !important;
}
</style>
