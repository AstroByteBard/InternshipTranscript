<template>
  <div class="administrator-header-container mb-4 shadow-lg animate-fade-in">
    <div class="hero-content d-flex justify-content-between align-items-center">
      <div class="hero-text-section px-4">
        <h1 class="hero-title animate-slide-up">System Administration</h1>
        <p class="hero-subtitle animate-slide-up-delay-1">Student & Advisor Control Center</p>
        <div class="hero-meta mt-3 d-flex align-items-center animate-slide-up-delay-2">
            <div class="hero-badge mr-3">
                <CIcon name="cil-calendar" class="mr-2 icon-gold" size="sm"/>
                Term {{ currentTerm }}
            </div>
            <div class="hero-badge">
                <CIcon name="cil-shield-check" class="mr-2 icon-gold" size="sm"/>
                Admin Access
            </div>
        </div>
      </div>
      <div class="hero-actions pr-4 animate-scale-in">
        <input type="file" ref="fileInputStudent" @change="onFileChangeStudent" accept=".xlsx, .xls, .csv" style="display: none;" />
        <input type="file" ref="fileInputAdvisor" @change="onFileChangeAdvisor" accept=".xlsx, .xls, .csv" style="display: none;" />

        <CButton 
          color="light" 
          class="btn-hero-action px-4 py-2 font-weight-bold shadow-sm d-flex align-items-center" 
          @click="showImportModal = true"
        >
          <CIcon name="cil-cloud-upload" class="mr-2 text-primary" size="lg"/>
          IMPORT
        </CButton>
      </div>
    </div>

    <!-- Import Selection Modal -->
    <CModal
      title="Import Selection"
      :show.sync="showImportModal"
      centered
      size="lg"
      class="import-modal"
    >
      <div class="p-4 text-center">
        <h4 class="mb-4 text-dark font-weight-bold">What would you like to import?</h4>
        <div class="d-flex justify-content-center mb-5">
          <div 
            class="selection-card mr-4" 
            :class="{'active': importType === 'Student'}"
            @click="importType = 'Student'"
          >
            <div class="icon-box bg-soft-red mb-3">
              <CIcon name="cil-people" height="40" class="text-danger" />
            </div>
            <div class="selection-label">Student</div>
          </div>
          <div 
            class="selection-card" 
            :class="{'active': importType === 'Advisor'}"
            @click="importType = 'Advisor'"
          >
            <div class="icon-box bg-soft-orange mb-3">
              <CIcon name="cil-briefcase" height="40" class="text-warning" />
            </div>
            <div class="selection-label">Advisor</div>
          </div>
        </div>

        <div class="action-options-container py-3 border-top">
          <div v-if="importType === 'Student'" class="animate-fade-in">
            <CRow>
              <CCol md="6">
                <CButton 
                  color="info" 
                  variant="outline" 
                  class="btn-option p-4 w-100 shadow-sm"
                  @click="triggerStudentFile"
                >
                  <CIcon name="cil-file" height="30" class="mb-2 d-block mx-auto" />
                  <span class="font-weight-bold">Upload Excel/CSV</span>
                  <small class="d-block mt-1 text-muted">Import multiple students from file</small>
                </CButton>
              </CCol>
              <CCol md="6">
                <CButton 
                  color="danger" 
                  variant="outline" 
                  class="btn-option p-4 w-100 shadow-sm"
                  @click="triggerStudentManual"
                >
                  <CIcon name="cil-pencil" height="30" class="mb-2 d-block mx-auto" />
                  <span class="font-weight-bold">Enter Text</span>
                  <small class="d-block mt-1 text-muted">Add a single student manually</small>
                </CButton>
              </CCol>
            </CRow>
          </div>
          <div v-if="importType === 'Advisor'" class="animate-fade-in">
            <CRow class="justify-content-center">
              <CCol md="6">
                <CButton 
                  color="warning" 
                  variant="outline" 
                  class="btn-option p-4 w-100 shadow-sm"
                  @click="triggerAdvisorManual"
                >
                  <CIcon name="cil-pencil" height="30" class="mb-2 d-block mx-auto" />
                  <span class="font-weight-bold">Enter Text</span>
                  <small class="d-block mt-1 text-muted">Add a single advisor manually</small>
                </CButton>
              </CCol>
            </CRow>
          </div>
        </div>
      </div>
      <template #footer>
        <CButton color="secondary" @click="showImportModal = false">Close</CButton>
        <CButton color="info" variant="link" class="ml-auto" @click="$emit('refresh'); showImportModal = false">
           <CIcon name="cil-reload" class="mr-1" size="sm"/> Sync Data
        </CButton>
      </template>
    </CModal>
    <!-- Abstract decorative elements -->
    <div class="hero-shape hero-shape-1"></div>
    <div class="hero-shape hero-shape-2"></div>
    <div class="hero-shape hero-gradient-overlay"></div>
  </div>
</template>

<script>
import * as XLSX from 'xlsx';
import { mapGetters } from 'vuex';

export default {
  name: 'AdministratorHeader',
  computed: {
    ...mapGetters('academic/schools', { storedSchools: 'schools' }),
    ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
    ...mapGetters('academic/course', { storedCourses: 'course' }),
    ...mapGetters('member/students', { storedStudents: 'students' }),
    
    currentTerm() {
        const date = new Date();
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        let semester = 1;
        if (month > 6 && month < 11) semester = 1;
        else if (month >= 11 || month < 4) semester = 2;
        else semester = 3;
        return `${semester}/${year}`;
    }
  },
  data() {
    return {
      showImportModal: false,
      importType: 'Student', // 'Student' or 'Advisor'
    }
  },
  methods: {
    triggerStudentFile() {
      this.$refs.fileInputStudent.click();
      this.showImportModal = false;
    },
    triggerStudentManual() {
      this.$emit('add-student');
      this.showImportModal = false;
    },
    triggerAdvisorManual() {
      this.$emit('add-advisor');
      this.showImportModal = false;
    },
    onFileChangeStudent(e) {
        const files = e.target.files;
        if (!files.length) return;
        const file = files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length < 2) return;
            const headers = jsonData[0].map(h => h.toString().toLowerCase().trim());
            const rows = jsonData.slice(1);
            const payload = [];

            rows.forEach(row => {
                if (row.length === 0) return;
                const getValue = (headerName) => {
                    const index = headers.indexOf(headerName.toLowerCase());
                    return index !== -1 ? row[index] : null;
                };

                const studentID = getValue('ID')
                const nameThai = getValue('Name-Surname (Thai)')
                const nameEnglish = getValue('Name-Surname')
                const email = getValue('Email');
                const programName = getValue('Programe');
                const schoolName = getValue('School');
                const courseName = getValue('Course');
                const company = getValue('Organization name');
                const semester = getValue('Semester');
                const year = getValue('Year');

                if (!studentID) return;

                const foundProgram = this.storedPrograms.find(p => Array.isArray(p.title) && p.title.some(t => t.key === 'en' && t.value === programName));
                const foundSchool = this.storedSchools.find(s => Array.isArray(s.title) && s.title.some(t => t.key === 'en' && t.value === schoolName));
                const foundCourse = this.storedCourses.find(c => Array.isArray(c.title) && c.title.some(t => t.key === 'en' && t.value === courseName));

                payload.push({
                    studentID,
                    name: [{ key: 'th', value: nameThai || '' }, { key: 'en', value: nameEnglish || '' }],
                    email,
                    info: {
                        semester: semester ? String(semester) : null,
                        program: foundProgram ? foundProgram._id : null,
                        school: foundSchool ? foundSchool._id : null,
                        course: foundCourse ? foundCourse._id : null,
                        year: year
                    },
                    company: company,
                });
            });

            if (payload.length > 0) {
                this.$store.dispatch("member/students/createStudents", payload).then(() => {
                    this.$emit('refresh');
                    alert(`Imported ${payload.length} students successfully.`);
                });
            }
            this.$refs.fileInputStudent.value = '';
        };
        reader.readAsArrayBuffer(file);
    },
    onFileChangeAdvisor(e) {
        const files = e.target.files;
        if (!files.length) return;
        const file = files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            if (jsonData.length < 2) return;
            const headers = jsonData[1].map(h => h ? h.toString().toLowerCase().trim() : '');
            const rows = jsonData.slice(1);
            const payload = [];

            rows.forEach(row => {
                if (row.length === 0) return;
                const getValue = (headerName) => {
                    const index = headers.indexOf(headerName.toLowerCase());
                    return index !== -1 ? row[index] : null;
                };

                const organizationName = getValue('ชื่อสถานประกอบการ\r\norganisation name');
                const organizationAddress = getValue('ที่อยู่สถานประกอบการ\r\norganisation adress');
                const province = getValue('จังหวัด\r\nprovince');
                const email = getValue("อีเมลผู้ประเมิน\r\nevaluator's email");
                const studentID = getValue('รหัสประจำตัว\r\nstudent id');

                if (!email) return;

                let studentRefId = null;
                if (studentID) {
                    const foundStudent = this.storedStudents.find(s => s.studentID === String(studentID));
                    if (foundStudent) studentRefId = foundStudent._id;
                }

                payload.push({
                    organizationName: organizationName || null,
                    organizationAddress: organizationAddress || null,
                    email: email,
                    province: province || null,
                    student: studentRefId,
                    year: new Date().getFullYear().toString()
                });
            });

            if (payload.length > 0) {
                this.$store.dispatch("member/advisors/createAdvisors", payload).then(() => {
                    this.$emit('refresh');
                    alert(`Imported ${payload.length} advisors successfully.`);
                }).catch(() => alert('Failed to import advisors.'));
            }
            this.$refs.fileInputAdvisor.value = '';
        };
        reader.readAsArrayBuffer(file);
    }
  }
}
</script>

<style scoped>
.administrator-header-container {
  background: linear-gradient(135deg, #8c1515 0%, #b91c1c 100%);
  border-radius: 20px;
  padding: 40px 24px;
  position: relative;
  overflow: hidden;
  color: white;
  min-height: 200px;
  display: flex;
  align-items: center;
}

.hero-content {
  width: 100%;
  position: relative;
  z-index: 10;
}

.hero-title {
  font-size: 32px;
  font-weight: 800;
  letter-spacing: -0.025em;
  margin-bottom: 4px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.hero-subtitle {
  font-size: 16px;
  opacity: 0.95;
  font-weight: 500;
  color: #FEC260; /* MFU Gold accent */
}

.hero-badge {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(12px);
  padding: 6px 14px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  border: 1px solid rgba(255, 255, 255, 0.15);
  transition: all 0.2s ease;
}

.hero-badge:hover {
  background: rgba(255, 255, 255, 0.15);
  transform: translateY(-2px);
}

.icon-gold {
  color: #FEC260;
}

.btn-hero-action {
  border-radius: 10px;
  border: none;
  background-color: white;
  color: #111827;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.btn-hero-action:hover {
  transform: translateY(-3px) scale(1.02);
  box-shadow: 0 10px 20px -5px rgba(0, 0, 0, 0.15);
  background-color: #f9fafb;
}

/* Decorative Shapes */
.hero-shape {
  position: absolute;
  pointer-events: none;
  z-index: 1;
}

.hero-shape-1 {
  width: 400px;
  height: 400px;
  background: radial-gradient(circle, rgba(254, 194, 96, 0.12) 0%, transparent 70%);
  top: -180px;
  right: -80px;
  border-radius: 50%;
}

.hero-shape-2 {
  width: 280px;
  height: 280px;
  background: radial-gradient(circle, rgba(254, 194, 96, 0.06) 0%, transparent 70%);
  bottom: -130px;
  left: 5%;
  border-radius: 50%;
}

.hero-gradient-overlay {
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, rgba(140, 21, 21, 0.15) 0%, transparent 100%);
  z-index: 2;
}

/* Animations */
.animate-fade-in {
  animation: fadeIn 0.6s ease-out;
}

.animate-slide-up {
  animation: slideUp 0.5s ease-out forwards;
}

.animate-slide-up-delay-1 {
  animation: slideUp 0.5s ease-out 0.1s forwards;
  opacity: 0;
}

.animate-slide-up-delay-2 {
  animation: slideUp 0.5s ease-out 0.2s forwards;
  opacity: 0;
}

.animate-scale-in {
  animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 0.3s forwards;
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(15px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.9);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Modal Content Styles */
.selection-card {
  width: 160px;
  padding: 24px;
  border-radius: 20px;
  border: 2px solid #f3f4f6;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: #f9fafb;
}

.selection-card:hover {
  transform: translateY(-5px);
  border-color: #e5e7eb;
  background: white;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
}

.selection-card.active {
  border-color: #8c1515;
  background: #fffafa;
  box-shadow: 0 10px 20px -5px rgba(140, 21, 21, 0.1);
}

.icon-box {
  width: 70px;
  height: 70px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto;
}

.bg-soft-red { background-color: #fee2e2; }
.bg-soft-orange { background-color: #ffedd5; }

.selection-label {
  font-weight: 700;
  font-size: 16px;
  color: #374151;
}

.btn-option {
  border-radius: 16px !important;
  border-width: 2px !important;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 120px;
}

.btn-option:hover {
  transform: scale(1.02);
  background-color: rgba(0, 0, 0, 0.02);
}

.import-modal >>> .modal-content {
  border-radius: 24px;
  border: none;
  overflow: hidden;
}

.import-modal >>> .modal-header {
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
  padding: 20px 24px;
}

.import-modal >>> .modal-title {
  font-weight: 800;
  color: #111827;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
</style>
