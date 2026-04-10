<template>
  <div class="student-dashboard">
    <!-- Hero Section -->
    <CRow class="mb-4">
      <CCol md="12">
        <CCard class="profile-hero-card border-0 shadow-sm">
          <CCardBody class="p-4 d-flex align-items-center justify-content-between flex-wrap">
            <div class="d-flex align-items-center">
              <div class="avatar-wrapper mr-4">
                <img :src="studentData.picture" class="hero-avatar shadow-lg" alt="Student Profile">
              </div>
              <div class="hero-info">
                <h1 class="font-weight-bold mb-1 text-primary-dark">{{ studentData.name }}</h1>
                <p class="text-muted mb-2">
                    <CIcon name="cil-fingerprint" size="sm" class="mr-1"/> 
                    ID: {{ studentData.studentID }}
                </p>
                <div class="d-flex flex-wrap">
                  <CBadge color="light" class="badge-custom mr-2 mb-2">
                      <CIcon name="cil-bank" size="sm" class="mr-1"/> 
                      {{ studentData.school }}
                  </CBadge>
                  <CBadge color="light" class="badge-custom mb-2">
                      <CIcon name="cil-education" size="sm" class="mr-1"/> 
                      {{ studentData.program }}
                  </CBadge>
                </div>
              </div>
            </div>
            <div class="action-hub mt-3 mt-lg-0">
              <CButton color="primary" class="download-btn px-4 py-2 shadow-sm font-weight-bold" @click="openDownloadModal">
                <CIcon name="cil-cloud-download" class="mr-2"/> Download Performance Report
              </CButton>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Competencies Analysis -->
    <CRow>
      <!-- General Competencies (Soft Skills) -->
      <CCol lg="6" class="mb-4">
        <CCard class="h-100 border-0 shadow-sm glass-card">
          <CCardHeader class="border-0 bg-transparent pt-4 px-4">
            <h4 class="mb-0 text-secondary-dark font-weight-bold">Soft Skills</h4>
            <p class="small text-muted mb-0">General Competencies Behavioral Analysis</p>
          </CCardHeader>
          <CCardBody class="px-4 pb-4">
            <div class="chart-container mb-4 d-flex justify-content-center">
              <CChartRadar
                :datasets="generalChartDatasets"
                :labels="generalChartLabels"
                :options="chartOptions"
                height="300px"
              />
            </div>
            <div class="skills-list">
              <div v-for="skill in generalCompetencies" :key="skill.id" class="skill-item mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <span class="font-weight-bold text-small text-dark">{{ skill.name }}</span>
                  <span class="text-primary font-weight-bold text-small">{{ skill.percentage }}%</span>
                </div>
                <CProgress :value="skill.percentage" :color="getProgressColor(skill.percentage)" class="progress-xs" />
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Specific Competencies (Hard Skills) -->
      <CCol lg="6" class="mb-4">
        <CCard class="h-100 border-0 shadow-sm glass-card">
          <CCardHeader class="border-0 bg-transparent pt-4 px-4">
            <h4 class="mb-0 text-secondary-dark font-weight-bold">Hard Skills</h4>
            <p class="small text-muted mb-0">Specific Technical Competencies Analysis</p>
          </CCardHeader>
          <CCardBody class="px-4 pb-4">
            <div class="chart-container mb-4 d-flex justify-content-center">
              <CChartRadar
                :datasets="specificChartDatasets"
                :labels="specificChartLabels"
                :options="chartOptions"
                height="300px"
              />
            </div>
            <div class="skills-list">
              <div v-for="skill in specificCompetencies" :key="skill.id" class="skill-item mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <span class="font-weight-bold text-small text-dark">{{ skill.name }}</span>
                  <span class="text-primary font-weight-bold text-small">{{ skill.percentage }}%</span>
                </div>
                <CProgress :value="skill.percentage" :color="getProgressColor(skill.percentage)" class="progress-xs" />
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Qualitative Feedback -->
    <CRow>
      <CCol md="12" class="mb-4">
        <CCard class="border-0 shadow-sm feedback-container">
          <CCardBody class="p-4">
            <CRow>
              <CCol md="6" class="mb-3 mb-md-0 border-right-divider">
                <div class="d-flex align-items-center mb-4 text-success">
                  <div class="icon-circle bg-light-success mr-3">
                    <CIcon name="cil-star" size="xl"/>
                  </div>
                  <h5 class="mb-0 font-weight-bold">Outstanding Performance</h5>
                </div>
                <div v-if="Outstanding.length > 0">
                  <div v-for="feedback in Outstanding" :key="feedback.id" class="feedback-card p-3 mb-3">
                    <ul class="mb-0 custom-list">
                      <li v-for="(point, pIdx) in feedback.points" :key="pIdx" class="mb-2 text-muted-dark">{{ point }}</li>
                    </ul>
                  </div>
                </div>
                <div v-else class="empty-state text-center py-4">
                  <p class="text-muted font-italic">Analytical feedback is being processed...</p>
                </div>
              </CCol>
              <CCol md="6">
                <div class="d-flex align-items-center mb-4 text-info">
                  <div class="icon-circle bg-light-info mr-3">
                    <CIcon name="cil-chart-line" size="xl"/>
                  </div>
                  <h5 class="mb-0 font-weight-bold">Growth Opportunities</h5>
                </div>
                <div v-if="Opportunities.length > 0">
                  <div v-for="feedback in Opportunities" :key="feedback.id" class="feedback-card p-3 mb-3">
                    <ul class="mb-0 custom-list">
                      <li v-for="(point, pIdx) in feedback.points" :key="pIdx" class="mb-2 text-muted-dark">{{ point }}</li>
                    </ul>
                  </div>
                </div>
                <div v-else class="empty-state text-center py-4">
                  <p class="text-muted font-italic">Continue your excellent progress in all domains!</p>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Download Modal -->
    <CModal
      title="Download Documentation"
      :show.sync="showDownloadModal"
      centered
      color="primary"
      size="sm"
    >
      <div class="py-3 px-1 text-center">
        <CIcon name="cil-cloud-download" size="xl" class="text-primary mb-3" style="font-size: 3rem"/>
        <h5 class="font-weight-bold mb-2">Ready to download?</h5>
        <p class="text-muted small mb-4">Select a report template to generate your personalized document.</p>
        <div class="text-left px-2">
          <label class="font-weight-bold small text-uppercase text-muted mb-2">Report Template</label>
          <CSelect
            :options="publicDocumentOptions"
            :value.sync="selectedDocumentId"
            placeholder="Select a template..."
            class="custom-select-modern"
          />
        </div>
      </div>
      <template #footer>
        <CButton @click="showDownloadModal = false" color="light" class="px-4 font-weight-bold">Cancel</CButton>
        <CButton @click="handleDownload" color="primary" class="px-4 font-weight-bold download-action-btn" :disabled="!selectedDocumentId">
          Generate PDF
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { CChartRadar } from '@coreui/vue-chartjs';
import { downloadClientPDF } from '@/utils/pdfGenerator';

export default {
    name: 'StudentDashboard',
    components: {
        CChartRadar
    },
    data() {
        return {
            targetStudentId: '',
            studentData: {
                name: '',
                studentID: '',
                school: '',
                program: '',
                picture: require('@/assets/avatars/3.jpg')
            },
            showDownloadModal: false,
            publicDocuments: [],
            selectedDocumentId: '',
            specificCompetencies: [],
            generalCompetencies: [],
            Outstanding: [],
            Opportunities: [],
            specificChartLabels: [],
            specificChartDatasets: [],
            generalChartLabels: [],
            generalChartDatasets: [],
            chartOptions: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20,
                        fontColor: '#4a4a4a',
                        fontSize: 12
                    }
                },
                scale: {
                    gridLines: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    },
                    angleLines: {
                      color: 'rgba(0, 0, 0, 0.05)'
                    },
                    ticks: {
                        beginAtZero: true,
                        max: 100,
                        stepSize: 20,
                        fontSize: 10,
                        showLabelBackdrop: false
                    },
                    pointLabels: {
                      fontSize: 11,
                      fontStyle: '600',
                      fontColor: '#636e72'
                    }
                }
            }
        };
    },
    async mounted() {
        await this.ensureAuthUser();
        await this.loadStudentData();
        await this.$store.dispatch('competencies/evaluation/evaluations');
        await this.loadEvaluationData();
    },
    methods: {
        getProgressColor(percent) {
          if (percent >= 80) return 'success';
          if (percent >= 50) return 'info';
          if (percent >= 30) return 'warning';
          return 'danger';
        },
        findStudent(id, email) {
            const students = Array.isArray(this.storedStudents) ? this.storedStudents : (this.storedStudents ? [this.storedStudents] : []);
            return students.find(s => s && (String(s._id) === String(id) || s.email === email));
        },
        async ensureAuthUser() {
            if (!this.$store?.state?.auth?.user) {
                try {
                    await this.$store.dispatch('auth/restoreAuth');
                } catch (err) {
                    console.error('Failed to restore auth', err);
                }
            }

            if (!this.$store?.state?.auth?.user) {
                try {
                    const userStr = localStorage.getItem('auth_user');
                    if (userStr) {
                        this.$store.commit('auth/setUser', JSON.parse(userStr));
                    }
                } catch (err) {
                    console.error('Failed to parse auth_user', err);
                }
            }
        },
        normalizeScoreToPercent(score) {
            const num = Number(score);
            if (!Number.isFinite(num)) return 0;
            if (num <= 1) return Math.round(num * 100);
            if (num <= 5) return Math.round((num / 5) * 100);
            if (num <= 10) return Math.round((num / 10) * 100);
            if (num <= 100) return Math.round(num);
            return 100;
        },
        mapEvaluationList(list) {
            if (!Array.isArray(list)) return [];
            return list.map((item, index) => ({
                id: index + 1,
                name: String(item?.answer?.title?.en || item?.answer?.title?.th || item?.criteriaId || 'Criteria'),
                percentage: this.normalizeScoreToPercent(item?.answer?.score ?? item?.score)
            }));
        },
        mapSuggestionList(list) {
            if (!Array.isArray(list)) return [];
            const points = list
                .map(item => item?.answer?.value)
                .filter(Boolean);
            if (!points.length) return [];
            return [
                {
                    id: 1,
                    name: this.studentData.name || 'Student',
                    role: 'Student',
                    picture: this.studentData.picture,
                    date: '',
                    points
                }
            ];
        },
        updateChartsFromCompetencies() {
            const specificLabels = this.specificCompetencies.map(s => s.name);
            const specificData = this.specificCompetencies.map(s => s.percentage);
            const generalLabels = this.generalCompetencies.map(s => s.name);
            const generalData = this.generalCompetencies.map(s => s.percentage);

            this.specificChartLabels = specificLabels;
            this.generalChartLabels = generalLabels;
            this.specificChartDatasets = [
                {
                    label: 'My Score',
                    data: specificData,
                    borderColor: '#E8A0BF',
                    backgroundColor: 'rgba(232, 160, 191, 0.25)',
                    pointBackgroundColor: '#E8A0BF',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#E8A0BF',
                    borderWidth: 3
                },
                {
                    label: 'Global Average',
                    data: new Array(specificData.length).fill(65),
                    borderColor: '#C9B1E0',
                    backgroundColor: 'rgba(201, 177, 224, 0.15)',
                    pointBackgroundColor: '#C9B1E0',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#C9B1E0',
                    borderDash: [5, 5],
                    borderWidth: 2
                }
            ];
            this.generalChartDatasets = [
                {
                    label: 'My Score',
                    data: generalData,
                    borderColor: '#E8A0BF',
                    backgroundColor: 'rgba(232, 160, 191, 0.25)',
                    pointBackgroundColor: '#E8A0BF',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#E8A0BF',
                    borderWidth: 3
                },
                {
                    label: 'Global Average',
                    data: new Array(generalData.length).fill(70),
                    borderColor: '#C9B1E0',
                    backgroundColor: 'rgba(201, 177, 224, 0.15)',
                    pointBackgroundColor: '#C9B1E0',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#C9B1E0',
                    borderDash: [5, 5],
                    borderWidth: 2
                }
            ];
        },
        async loadEvaluationData() {
            try {
                console.group('Evaluation Load Debug');
                const authUser = this.$store?.state?.auth?.user;
                const email = authUser?.email || (() => {
                    try {
                        const userStr = localStorage.getItem('auth_user');
                        return userStr ? JSON.parse(userStr)?.email : '';
                    } catch (err) {
                        return '';
                    }
                })();
                console.log('Lookup Email:', email);
                if (!email && !this.targetStudentId) {
                    console.warn('Skip eval load: no email/targetId');
                    console.groupEnd();
                    return;
                }

                const student = this.findStudent(this.targetStudentId || authUser?._id, email);
                console.log('Found Student for Eval:', student);
                
                if (!student || !student._id) {
                    console.warn('Evaluation load: student not identified', this.targetStudentId || email);
                    console.groupEnd();
                    return;
                }

                if (!this.storedEvaluations || this.storedEvaluations.length === 0) {
                    console.log('Fetching evaluations...');
                    await this.$store.dispatch('competencies/evaluation/evaluations');
                }

                const evalPayload = this.storedEvaluations || [];
                console.log('Raw Evaluations Payload:', evalPayload);
                
                const evalData = Array.isArray(evalPayload)
                    ? evalPayload.find(e => {
                        const sId = e?.studentId?._id || e?.studentId;
                        return String(sId) === String(student._id);
                    })
                    : evalPayload;
                
                console.log('Filtered Evaluation Data:', evalData);
                console.groupEnd();

                if (!evalData) return;

                const softskills = Array.isArray(evalData) ? evalData[0]?.softskills : evalData.softskills;
                const hardskills = Array.isArray(evalData) ? evalData[0]?.hardskills : evalData.hardskills;
                const suggestions = Array.isArray(evalData)
                    ? (evalData[0]?.suggestions || evalData[0]?.sugestion)
                    : (evalData.suggestions || evalData.sugestion);

                const general = this.mapEvaluationList(softskills);
                const specific = this.mapEvaluationList(hardskills);
                const suggestionList = this.mapSuggestionList(suggestions);

                if (general.length) this.generalCompetencies = general;
                if (specific.length) this.specificCompetencies = specific;
                if (suggestionList.length) {
                    this.Outstanding = suggestionList;
                    this.Opportunities = [];
                }
                this.updateChartsFromCompetencies();
            } catch (err) {
                console.error('Failed to load evaluation data', err);
            }
        },
        async loadStudentData() {
            console.group('Student Load Debug');
            if (this.$store.state.auth && this.$store.state.auth.user) {
                const user = this.$store.state.auth.user;
                console.log('Auth User from Store:', user);
                
                const email = user?.email || (() => {
                    try {
                        const userStr = localStorage.getItem('auth_user');
                        return userStr ? JSON.parse(userStr)?.email : '';
                    } catch (err) {
                        return '';
                    }
                })();
                console.log('Determined Email:', email);

                this.studentData = {
                    ...this.studentData,
                    name: user.name || user.email || this.studentData.name,
                    studentID: user.studentID || this.studentData.studentID,
                    picture: user.picture || this.studentData.picture
                };

                // Fetch student data
                const currentUserId = user?._id || this.targetStudentId;
                console.log('ID to use (user._id || targetStudentId):', currentUserId);
                
                try {
                    if (currentUserId) {
                        console.log('Attempting explore by ID:', currentUserId);
                        await this.$store.dispatch('member/students/explore', { id: currentUserId });
                    }
                    
                    let student = this.findStudent(currentUserId, email);
                    console.log('Initial find target student:', student);

                    if (!student) {
                        console.warn('Student not found after explore. Trying to fetch all students as fallback...');
                        await this.$store.dispatch('member/students/students');
                        student = this.findStudent(currentUserId, email);
                        console.log('Find result after fetching all:', student);
                    }

                    if (student) {
                        console.log('Hydrating studentData with:', student);
                        const nameEn = Array.isArray(student.name)
                            ? (student.name.find(n => n?.key === 'en')?.value || student.name.find(n => n?.value)?.value)
                            : '';
                        const schoolEn = Array.isArray(student.info?.school?.title)
                            ? (student.info.school.title.find(t => t?.key === 'en')?.value || student.info.school.title.find(t => t?.value)?.value)
                            : '';
                        const programEn = Array.isArray(student.info?.program?.title)
                            ? (student.info.program.title.find(t => t?.key === 'en')?.value || student.info.program.title.find(t => t?.value)?.value)
                            : '';

                        this.studentData = {
                            ...this.studentData,
                            name: nameEn || this.studentData.name,
                            studentID: student.studentID || this.studentData.studentID,
                            school: schoolEn || this.studentData.school,
                            program: programEn || this.studentData.program
                        };

                        if (this.$store?.commit) {
                            this.$store.commit('auth/setUser', {
                                ...user,
                                name: nameEn || user.name,
                                email: student.email || user.email,
                                studentID: student.studentID || user.studentID
                            });
                        }
                    } else {
                        console.error('Student profile completely not found for email/ID', email, currentUserId);
                        this.studentData = {
                            ...this.studentData,
                            name: email || this.studentData.name,
                            studentID: this.studentData.studentID || 'Not Found',
                            school: '-',
                            program: '-'
                        };
                    }
                } catch (err) {
                    console.error('Failed in loadStudentData process', err);
                }
            } else {
                console.warn('No auth user found in store during loadStudentData');
            }
            console.groupEnd();
        },
        async openDownloadModal() {
            this.showDownloadModal = true;
            this.selectedDocumentId = '';
            try {
                const res = await this.$api.documents('get', { status: 'Published' });
                this.publicDocuments = res?.data?.data || [];
            } catch (err) {
                console.error('Failed to load documents', err);
                this.publicDocuments = [];
            }
        },
        buildDocumentData() {
            const toPdfItems = (items) => {
                if (!Array.isArray(items)) return [];
                return items.map(item => ({
                    name: item?.name || 'N/A',
                    score: item?.percentage ?? item?.score ?? 0
                }));
            };
            return {
                StudentName: this.studentData.name,
                StudentID: this.studentData.studentID,
                School: this.studentData.school,
                Program: this.studentData.program,
                AcademyYear: String(new Date().getFullYear()),
                CompanyLogo: '',
                StudentPhoto: this.studentData.picture,
                GeneralCompetencies: toPdfItems(this.generalCompetencies),
                SpecificCompetencies: toPdfItems(this.specificCompetencies),
                Outstanding: this.Outstanding,
                Opportunities: this.Opportunities
            };
        },
        async handleDownload() {
            const doc = this.publicDocuments.find(d => d._id === this.selectedDocumentId);
            if (!doc) return;

            try {
                if (doc.content && doc.content.elements) {
                    await downloadClientPDF(
                        doc.content,
                        this.buildDocumentData(),
                        `${doc.title || doc.name || 'document'}.pdf`
                    );
                } else {
                    throw new Error('Template data is empty or invalid.');
                }
            } catch (err) {
                console.error('Failed to download PDF via Client', err);
            }
        },
    },
    computed: {
        ...mapGetters('member/students', { storedStudents: 'students' }),
        ...mapGetters('competencies/evaluation', { storedEvaluations: 'evaluations' }),
        publicDocumentOptions() {
            return this.publicDocuments.map(doc => ({
                value: doc._id,
                label: doc.title || doc.name || doc._id
            }));
        }
    }
};
</script>

<style scoped>
.student-dashboard {
  padding: 2.5rem 1.5rem;
  background-color: #f4f7fa;
  min-height: calc(100vh - 50px);
}

/* Hero Section */
.profile-hero-card {
  background: linear-gradient(135deg, #ffffff 0%, #fdf5f8 100%);
  border-radius: 20px;
  overflow: hidden;
  position: relative;
}

.profile-hero-card::after {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(232, 160, 191, 0.05) 0%, transparent 70%);
  z-index: 0;
}

.hero-avatar {
  width: 100px;
  height: 100px;
  border-radius: 24px;
  object-fit: cover;
  border: 4px solid #fff;
  z-index: 1;
}

.text-primary-dark {
  color: #2d3436;
  font-size: 1.8rem;
  letter-spacing: -0.5px;
}

.badge-custom {
  background-color: #fff;
  border: 1px solid #edf2f7;
  color: #636e72;
  font-weight: 600;
  padding: 0.6rem 0.8rem;
  border-radius: 12px;
}

.download-btn {
  background-color: #E8A0BF;
  border: none;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  color: #fff;
}

.download-btn:hover {
  background-color: #d68ca9;
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(232, 160, 191, 0.35) !important;
}

/* Competency Cards */
.glass-card {
  background: rgba(255, 255, 255, 0.85) !important;
  backdrop-filter: blur(8px);
  border-radius: 24px !important;
  transition: all 0.3s ease;
}

.glass-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 15px 35px rgba(0,0,0,0.05) !important;
}

.text-secondary-dark {
  color: #4a4a4a;
}

.text-small {
  font-size: 0.85rem;
}

/* Feedback Section */
.feedback-container {
  border-radius: 20px;
}

.border-right-divider {
  border-right: 1px solid #f1f3f5;
}

.icon-circle {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.bg-light-success { background-color: #e6fffa; }
.bg-light-info { background-color: #e6f6ff; }

.feedback-card {
  background: #fafbfc;
  border-radius: 16px;
  border-left: 4px solid #f1f3f5;
  transition: all 0.2s ease;
}

.feedback-card:hover {
  background: #fff;
  border-left-color: #E8A0BF;
  transform: translateX(4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.03);
}

.custom-list {
  padding-left: 1.2rem;
  list-style-type: circle;
}

.text-muted-dark {
  color: #636e72;
}

/* Modal Styling */
.custom-select-modern {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  height: auto;
  padding: 0.3rem;
}

.download-action-btn {
  border-radius: 12px;
  padding: 0.6rem 2rem;
}

@media (max-width: 991px) {
  .border-right-divider {
    border-right: none;
    border-bottom: 1px solid #f1f3f5;
    margin-bottom: 2rem;
    padding-bottom: 1.5rem;
  }
}

::v-deep .progress {
  height: 6px;
  background-color: #edf2f7;
  border-radius: 10px;
}

::v-deep .progress-bar {
  border-radius: 10px;
}

::v-deep .chart-container canvas {
  filter: drop-shadow(0 0 5px rgba(0,0,0,0.02));
}
</style>

