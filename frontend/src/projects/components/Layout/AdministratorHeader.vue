<template>
  <div class="administrator-header-container mb-4 shadow-lg animate-fade-in">
    <div class="hero-content d-flex justify-content-between align-items-center">
      <div class="hero-text-section px-4">
        <h1 class="hero-title animate-slide-up">{{ $t('components.layout_administratorheader_vue_system_administration')
          }}</h1>
        <p class="hero-subtitle animate-slide-up-delay-1">{{
          $t('components.layout_administratorheader_vue_student_advisor_control_cente') }}</p>
        <div class="hero-meta mt-3 d-flex align-items-center animate-slide-up-delay-2">
          <div class="hero-badge mr-3">
            <CIcon name="cil-calendar" class="mr-2 icon-gold" size="sm" />
            Term {{ currentTerm }}
          </div>
          <div class="hero-badge">
            <CIcon name="cil-shield-alt" class="mr-2 icon-gold" size="sm" />{{
              $t('components.layout_administratorheader_vue_admin_access') }}
          </div>
        </div>
      </div>
      <div class="hero-actions pr-4 animate-scale-in">
        <input type="file" ref="fileInput" @change="onFileChange" accept=".xlsx, .xls, .csv"
          style="display: none;" />

        <CButton color="light" class="btn-hero-action px-4 py-2 font-weight-bold shadow-sm d-flex align-items-center"
          @click="triggerImport">
          <CIcon name="cil-cloud-upload" class="mr-2 text-primary" size="lg" />{{
            $t('components.layout_administratorheader_vue_import') }}
        </CButton>
      </div>
    </div>

    <!-- Import Action Modal -->
    <CModal :title="importTitle" :show.sync="showImportModal"
      centered size="lg" class="import-modal">
      <div class="p-4 text-center">
        <CRow>
          <CCol md="6">
            <CButton color="info" variant="outline" class="btn-option p-4 w-100 shadow-sm"
              @click="triggerFile">
              <CIcon name="cil-file" height="30" class="mb-2 d-block mx-auto" />
              <span class="font-weight-bold">{{ $t('components.layout_administratorheader_vue_upload_excel_csv') }}</span>
              <small class="d-block mt-1 text-muted">{{ tab === 'Advisor' ? $t('components.layout_administratorheader_vue_import_multiple_advisors_from') : $t('components.layout_administratorheader_vue_import_multiple_students_from') }}</small>
            </CButton>
          </CCol>
          <CCol md="6">
            <CButton :color="tab === 'Advisor' ? 'warning' : 'danger'" variant="outline" class="btn-option p-4 w-100 shadow-sm"
              @click="triggerManual">
              <CIcon name="cil-pencil" height="30" class="mb-2 d-block mx-auto" />
              <span class="font-weight-bold">{{ $t('components.layout_administratorheader_vue_enter_text') }}</span>
              <small class="d-block mt-1 text-muted">{{ tab === 'Advisor' ? $t('components.layout_administratorheader_vue_add_a_single_advisor_manually') : $t('components.layout_administratorheader_vue_add_a_single_student_manually') }}</small>
            </CButton>
          </CCol>
        </CRow>
      </div>
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
import studentImport from '@/utils/studentImport';

export default {
  name: 'AdministratorHeader',
  props: {
    tab: { type: String, default: 'Student' }
  },
  computed: {
    ...mapGetters('academic/schools', { storedSchools: 'schools' }),
    ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
    ...mapGetters('academic/course', { storedCourses: 'course' }),
    ...mapGetters('member/students', { storedStudents: 'students' }),
    ...mapGetters('setting/province', { storedProvinces: 'province' }),
    ...mapGetters('setting/semester', { storedSemesters: 'item' }),

    currentTerm() {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      let semester = 1;
      if (month > 6 && month < 11) semester = 1;
      else if (month >= 11 || month < 4) semester = 2;
      else semester = 3;
      return `${semester}/${year}`;
    },
    importTitle() {
      return (this.$i18n.locale || 'en').startsWith('th') ? 'เลือกการนำเข้า' : 'Import Select';
    }
  },
  data() {
    return {
      showImportModal: false
    }
  },
  methods: {
    triggerImport() {
      this.showImportModal = true;
    },
    triggerFile() {
      this.$refs.fileInput.click();
      this.showImportModal = false;
    },
    triggerManual() {
      this.$emit(this.tab === 'Advisor' ? 'add-advisor' : 'add-student');
      this.showImportModal = false;
    },
    onFileChange(e) {
      const files = e.target.files;
      if (!files.length) return;
      const file = files[0];
      const reader = new FileReader();

      const studentSignature = [
        'ID', 'Name-Surname(TH)', 'Name-Surname(EN)', 'Programe(EN)',
        'School(EN)', 'Organisation Name(EN)', 'Course(EN)',
        'Semester(EN)', 'Year(EN)', 'Semester(TH)', 'Year(TH)'
      ];

      const advisorColumnMap = {
        'Student ID': 'studentID',
        'Name-Surname(TH)': null,
        'Organisation Name(TH)': 'organizationName',
        'Organisation Adress': 'organizationAddress',
        'Province(TH)': 'province',
        'Evaluators Email': 'email'
      };

      const detectType = (headers) => {
        if (!Array.isArray(headers) || headers.length === 0) return null;
        const normalized = headers.map(h => studentImport.normalizeHeader(h));
        const studentScore = studentSignature.filter(col => normalized.includes(studentImport.normalizeHeader(col))).length;
        const advisorScore = Object.keys(advisorColumnMap).filter(col => normalized.includes(studentImport.normalizeHeader(col))).length;
        if (studentScore > advisorScore && studentScore >= 4) return 'Student';
        if (advisorScore > studentScore && advisorScore >= 3) return 'Advisor';
        if (studentScore >= 4 && advisorScore >= 3) return studentScore >= advisorScore ? 'Student' : 'Advisor';
        if (studentScore >= 4) return 'Student';
        if (advisorScore >= 3) return 'Advisor';
        return null;
      };

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const sheetNames = Array.isArray(workbook?.SheetNames) ? workbook.SheetNames : [];
          let studentPayloads = [];
          let advisorPayloads = [];
          let studentCount = 0;
          let advisorCount = 0;

          let validationFailed = false;
          sheetNames.forEach((sheetName) => {
            if (validationFailed) return;
            const worksheet = workbook?.Sheets?.[sheetName];
            if (!worksheet) return;

            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: null });
            if (!Array.isArray(jsonData) || jsonData.length < 1) return;

            let headerIndex = -1;
            let rawHeaders = [];
            for (let i = 0; i < Math.min(jsonData.length, 10); i++) {
              const row = jsonData[i];
              if (!Array.isArray(row)) continue;
              const nonEmpty = row.some(c => c !== undefined && c !== null && c !== '');
              if (nonEmpty) {
                headerIndex = i;
                rawHeaders = row.map(h => (h === undefined || h === null) ? '' : String(h));
                break;
              }
            }

            if (headerIndex === -1) return;
            const type = detectType(rawHeaders);
            if (!type) return;

            if (type !== (this.tab === 'Advisor' ? 'Advisor' : 'Student')) {
                const lang = this.$i18n.locale || 'en';
                const expectedType = this.tab === 'Advisor' ? (lang.startsWith('th') ? 'อาจารย์ที่ปรึกษา' : 'Advisor') : (lang.startsWith('th') ? 'นักศึกษา' : 'Student');
                const msg = lang.startsWith('th')
                    ? `หน้านี้รองรับเฉพาะการนำเข้า${expectedType}เท่านั้น`
                    : `This page only supports importing ${expectedType} data.`;
                alert(msg);
                this.$refs.fileInput.value = '';
                validationFailed = true;
                return;
            }

            const requiredColumns = type === 'Student' ? studentSignature : Object.keys(advisorColumnMap);
            const normalizedHeaders = rawHeaders.map(h => studentImport.normalizeHeader(h));
            const missingColumns = requiredColumns.filter(col =>
                !normalizedHeaders.includes(studentImport.normalizeHeader(col))
            );
            if (missingColumns.length > 0) {
                const lang = this.$i18n.locale || 'en';
                const msg = lang.startsWith('th')
                    ? `รูปแบบไฟล์ไม่ถูกต้อง: คอลัมน์ต่อไปนี้หายไป:\n${missingColumns.join('\n')}`
                    : `Invalid file format. Missing columns:\n${missingColumns.join('\n')}`;
                alert(msg);
                this.$refs.fileInput.value = '';
                validationFailed = true;
                return;
            }

            const rows = jsonData.slice(headerIndex + 1);

            if (type === 'Student') {
              const headers = rawHeaders;
              rows.forEach(row => {
                if (!Array.isArray(row) || row.length === 0) return;
                const getCell = (aliases) => {
                  const index = studentImport.getHeaderIndex(headers, aliases);
                  if (index === -1) return null;
                  const val = row[index];
                  return val === undefined || val === null || val === '' ? null : val;
                };
                const studentID = getCell(studentImport.HEADER_SYNONYMS.studentID);
                if (!studentID) return;
                const nameThai = getCell(studentImport.HEADER_SYNONYMS.nameThai);
                const nameEnglish = getCell(studentImport.HEADER_SYNONYMS.nameEnglish);
                const programName = getCell(studentImport.HEADER_SYNONYMS.programName);
                const schoolName = getCell(studentImport.HEADER_SYNONYMS.schoolName);
                const organizationName = getCell(studentImport.HEADER_SYNONYMS.organizationName);
                const courseName = getCell(studentImport.HEADER_SYNONYMS.courseName);
                const semesterEn = getCell(studentImport.HEADER_SYNONYMS.semesterEn);
                const semesterTh = getCell(studentImport.HEADER_SYNONYMS.semesterTh);
                const yearEn = getCell(studentImport.HEADER_SYNONYMS.yearEn);
                const yearTh = getCell(studentImport.HEADER_SYNONYMS.yearTh);
                const email = getCell(['email', 'อีเมล']);

                const foundProgram = studentImport.findAcademicRecord(this.storedPrograms || [], programName);
                const foundSchool = studentImport.findAcademicRecord(this.storedSchools || [], schoolName);
                const foundCourse = studentImport.findAcademicRecord(this.storedCourses || [], courseName);
                const foundSemester = studentImport.findAcademicRecord(this.storedSemesters || [], semesterEn || semesterTh);

                studentPayloads.push({
                  studentID: String(studentID).trim(),
                  name: [
                    { key: 'th', value: nameThai ? String(nameThai).trim() : '' },
                    { key: 'en', value: nameEnglish ? String(nameEnglish).trim() : '' }
                  ],
                  email: email ? String(email).trim() : `${String(studentID).trim()}@lamduan.mfu.ac.th`,
                  company: organizationName ? String(organizationName).trim() : null,
                  info: {
                    semester: foundSemester ? foundSemester._id : null,
                    program: foundProgram ? foundProgram._id : null,
                    programName: programName ? String(programName).trim() : null,
                    school: foundSchool ? foundSchool._id : null,
                    schoolName: schoolName ? String(schoolName).trim() : null,
                    course: foundCourse ? foundCourse._id : null,
                    courseName: courseName ? String(courseName).trim() : null,
                    year: [
                      yearEn ? { key: 'en', value: String(yearEn).trim() } : null,
                      yearTh ? { key: 'th', value: String(yearTh).trim() } : null
                    ].filter(Boolean)
                  }
                });
              });
            } else {
              const colIndices = {};
              Object.keys(advisorColumnMap).forEach((colName) => {
                const norm = studentImport.normalizeHeader(colName);
                const idx = rawHeaders.findIndex(h => studentImport.normalizeHeader(h) === norm);
                if (idx !== -1) colIndices[colName] = idx;
              });

              rows.forEach(row => {
                if (!row || row.length === 0) return;
                const getVal = (colName) => {
                  const idx = colIndices[colName];
                  return idx !== undefined && row[idx] !== undefined && row[idx] !== null ? String(row[idx]).trim() : null;
                };
                const email = getVal('Evaluators Email');
                if (!email) return;
                const provinceRaw = getVal('Province(TH)');
                let provinceId = null;
                if (provinceRaw) {
                  const cleanProv = provinceRaw.toLowerCase();
                  const foundProv = this.storedProvinces.find(p => {
                    if (!p.title || !Array.isArray(p.title)) return false;
                    return p.title.some(t => t.value && t.value.toLowerCase().trim() === cleanProv);
                  });
                  if (foundProv) provinceId = foundProv._id;
                }
                const studentID = getVal('Student ID');
                let studentRefId = null;
                if (studentID) {
                  const foundStudent = (this.storedStudents || []).find(s => s.studentID === studentID);
                  if (foundStudent) studentRefId = foundStudent._id;
                }
                advisorPayloads.push({
                  organizationName: getVal('Organisation Name(TH)'),
                  organizationAddress: getVal('Organisation Adress'),
                  email: email,
                  province: provinceId,
                  student: studentRefId
                });
              });
            }
          });

          studentCount = studentPayloads.length;
          advisorCount = advisorPayloads.length;

          let promises = [];
          if (studentCount > 0) {
            promises.push(
              this.$store.dispatch("member/students/createStudents", studentPayloads)
            );
          }
          if (advisorCount > 0) {
            promises.push(
              this.$store.dispatch("member/advisors/createAdvisors", advisorPayloads)
            );
          }

          if (promises.length > 0) {
            Promise.all(promises).then(() => {
              this.$emit('refresh');
              let msg = '';
              if (studentCount > 0) msg += `Imported ${studentCount} student(s). `;
              if (advisorCount > 0) msg += `Imported ${advisorCount} advisor(s). `;
              alert(msg.trim());
            }).catch((err) => {
              console.error('Import error:', err);
              alert('Failed to import. Please check if the data format is correct.');
            });
          } else {
            alert('No valid data found in the file.');
          }
        } catch (err) {
          console.error('Import error:', err);
          alert('Import Error: ' + (err.message || err));
        }
        this.$refs.fileInput.value = '';
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
  color: #FEC260;
  /* MFU Gold accent */
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
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
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

.bg-soft-red {
  background-color: #fee2e2;
}

.bg-soft-orange {
  background-color: #ffedd5;
}

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

.import-modal>>>.modal-content {
  border-radius: 24px;
  border: none;
  overflow: hidden;
}

.import-modal>>>.modal-header {
  background: #f9fafb;
  border-bottom: 1px solid #f3f4f6;
  padding: 20px 24px;
}

.import-modal>>>.modal-title {
  font-weight: 800;
  color: #111827;
}

.animate-fade-in {
  animation: fadeIn 0.4s ease-out;
}
</style>
