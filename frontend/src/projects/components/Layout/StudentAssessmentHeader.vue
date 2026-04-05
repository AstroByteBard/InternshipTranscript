<template>
  <CCard class="student-assessment-header border-0 shadow-sm mb-4">
    <CCardBody class="p-4">
      <div class="d-flex flex-column flex-md-row align-items-center">
        <!-- Profile Avatar Section -->
        <div class="profile-avatar-wrapper mb-3 mb-md-0 mr-md-5">
          <div class="avatar-circle shadow">
            {{ avatarInitial }}
          </div>
          <div class="status-indicator">
            <span class="status-dot"></span>
            ACTIVE INTERN
          </div>
        </div>

        <!-- Student Basic Info -->
        <div class="flex-grow-1 text-center text-md-left">
          <h2 class="student-full-name mb-1">{{ studentName }}</h2>
          <p class="student-id-badge d-inline-block px-3 py-1 rounded-pill mb-4">
            <CIcon name="cil-id-card" class="mr-2" /> {{ studentID }}
          </p>

          <!-- Detail Grid -->
          <CRow class="student-details-grid">
            <CCol sm="6" md="3" class="mb-3">
              <div class="detail-item">
                <div class="detail-label">SCHOOL / FACULTY</div>
                <div class="detail-value">{{ schoolName }}</div>
              </div>
            </CCol>
            <CCol sm="6" md="3" class="mb-3">
              <div class="detail-item">
                <div class="detail-label">PROGRAM / MAJOR</div>
                <div class="detail-value">{{ programName }}</div>
              </div>
            </CCol>
            <CCol sm="6" md="3" class="mb-3">
              <div class="detail-item">
                <div class="detail-label">ACADEMIC YEAR</div>
                <div class="detail-value text-danger font-weight-bold">{{ academicYear }}</div>
              </div>
            </CCol>
            <CCol sm="6" md="3" class="mb-3">
              <div class="detail-item">
                <div class="detail-label">SEMESTER</div>
                <div class="detail-value">{{ semester }}</div>
              </div>
            </CCol>
          </CRow>
        </div>
      </div>
    </CCardBody>
  </CCard>
</template>

<script>
export default {
  name: 'StudentAssessmentHeader',
  props: {
    studentName: { type: String, default: 'Student Name' },
    studentID: { type: String, default: 'N/A' },
    schoolName: { type: String, default: 'N/A' },
    programName: { type: String, default: 'N/A' },
    academicYear: { type: String, default: 'N/A' },
    semester: { type: String, default: 'N/A' }
  },
  computed: {
    avatarInitial() {
      return this.studentName ? this.studentName.charAt(0).toUpperCase() : 'S';
    }
  }
}
</script>

<style scoped>
.student-assessment-header {
  border-radius: 20px;
  background: #ffffff;
  overflow: hidden;
}

.avatar-circle {
  width: 100px;
  height: 100px;
  background: linear-gradient(135deg, #ef4444, #b91c1c);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #ffffff;
  font-size: 42px;
  font-weight: 800;
  border: 4px solid #ffffff;
}

.profile-avatar-wrapper {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.status-indicator {
  margin-top: 12px;
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 1px;
  color: #10b981;
  background: #ecfdf5;
  padding: 4px 10px;
  border-radius: 6px;
  display: flex;
  align-items: center;
}

.status-dot {
  width: 6px;
  height: 6px;
  background: #10b981;
  border-radius: 50%;
  margin-right: 6px;
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.2);
}

.student-full-name {
  font-size: 28px;
  font-weight: 800;
  color: #1e293b;
  letter-spacing: -0.5px;
}

.student-id-badge {
  background: #f1f5f9;
  color: #475569;
  font-size: 13px;
  font-weight: 700;
  border: 1px solid #e2e8f0;
}

.detail-label {
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 1px;
  margin-bottom: 4px;
}

.detail-value {
  font-size: 14px;
  font-weight: 700;
  color: #334155;
  line-height: 1.2;
}

@media (max-width: 768px) {
  .student-full-name { font-size: 22px; }
  .avatar-circle { width: 80px; height: 80px; font-size: 32px; }
}
</style>
