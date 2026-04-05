<template>
  <div class="fill-form-page h-100 overflow-auto bg-light">
    <!-- Sticky Navigation -->
    <FormNavbar :studentName="displayName" :studentID="studentID || 'Student'" />
    
    <!-- Unified Header: Hero Banner + Overlapping Profile Card -->
    <div class="unified-header-container position-relative mb-5"> 
      <div class="profile-overlap-container container-fluid px-4">
        <StudentAssessmentHeader 
            v-if="studentDoc"
            :studentName="displayName"
            :studentID="studentID"
            :schoolName="schoolInfo"
            :programName="programInfo"
            :academicYear="yearInfo"
            :semester="semesterInfo"
        />
        
        <!-- Guidelines Info Box -->
        <CCard class="guidelines-info-card border-0 shadow-sm mt-4 animate-slide-up">
          <CCardBody class="p-3 d-flex align-items-center">
            <div class="info-icon mr-3">
              <CIcon name="cil-info" class="text-info" size="xl" />
            </div>
            <div>
              <div class="font-weight-bold text-dark mb-1">Evaluation Guidelines</div>
              <div class="small text-muted">
                Please rate each competency from 1 (Needs Improvement) to 5 (Excellent). 
                Your feedback is essential for the student's academic progress and career development.
              </div>
            </div>
          </CCardBody>
        </CCard>
      </div>
    </div>

    <CContainer fluid class="px-4 content-body animate-fade-in">
      <!-- Softskills Section -->
      <div class="section-title-wrapper mb-3 d-flex align-items-center">
        <div class="section-badge text-danger mr-3">SECTION 01</div>
        <h3 class="section-main-title">General Competencies (Softskills)</h3>
      </div>
      
      <div class="competency-list mb-5">
        <CCard v-for="(item, idx) in softskillItems" :key="item._id" class="competency-container-card border-0 mb-4 shadow-sm">
          <CCardBody class="p-0">
            <div class="competency-header p-4 border-bottom bg-light-soft">
                <div class="d-flex align-items-center">
                    <div class="item-number mr-3">{{ String(idx + 1).padStart(2, '0') }}</div>
                    <h5 class="competency-title mb-0">{{ translate(item.title) }}</h5>
                </div>
            </div>
            <div class="question-items-wrapper">
                <div v-for="(conf, cIdx) in (item.config || [])" :key="cIdx" class="question-row p-4 border-bottom-dashed">
                    <CRow class="align-items-center">
                        <CCol lg="7" md="6" class="mb-3 mb-md-0">
                            <div class="d-flex align-items-start">
                                <div class="q-marker mr-3">{{ cIdx + 1 }}</div>
                                <div>
                                    <div class="q-category mb-1" v-if="conf.label || conf.variable">{{ translate(conf.label || conf.variable) }}</div>
                                    <div class="q-text">{{ translate(conf.question) }}</div>
                                </div>
                            </div>
                        </CCol>
                        <CCol lg="5" md="6">
                            <RatingSelector v-model="evaluation.softskills[item._id + '_' + cIdx]" />
                        </CCol>
                    </CRow>
                </div>
            </div>
          </CCardBody>
        </CCard>
      </div>

      <!-- Hardskills Section -->
      <div class="section-title-wrapper mb-3 d-flex align-items-center">
        <div class="section-badge text-success mr-3">SECTION 02</div>
        <h3 class="section-main-title">Program-Specific Skills (Hardskills)</h3>
      </div>
      
      <div class="competency-list mb-5">
        <CCard v-for="(item, idx) in hardskillItems" :key="item._id" class="competency-container-card border-0 mb-4 shadow-sm">
          <CCardBody class="p-0">
            <div class="competency-header p-4 border-bottom bg-light-spec">
                <div class="d-flex align-items-center">
                    <div class="item-number mr-3">{{ String(idx + 1).padStart(2, '0') }}</div>
                    <div>
                        <h5 class="competency-title mb-1">{{ translate(item.title) }}</h5>
                        <CBadge color="light" class="border text-muted px-2 py-1">{{ item.program ? translate(item.program.title) : 'General' }}</CBadge>
                    </div>
                </div>
            </div>
            <div class="question-items-wrapper">
                <div v-for="(conf, cIdx) in (item.config || [])" :key="cIdx" class="question-row p-4 border-bottom-dashed">
                    <CRow class="align-items-center">
                        <CCol lg="7" md="6" class="mb-3 mb-md-0">
                            <div class="d-flex align-items-start">
                                <div class="q-marker mr-3 text-success">{{ cIdx + 1 }}</div>
                                <div>
                                    <div class="q-category mb-1 text-success" v-if="conf.label || conf.variable">{{ translate(conf.label || conf.variable) }}</div>
                                    <div class="q-text">{{ translate(conf.question) }}</div>
                                </div>
                            </div>
                        </CCol>
                        <CCol lg="5" md="6">
                            <RatingSelector v-model="evaluation.hardskills[item._id + '_' + cIdx]" />
                        </CCol>
                    </CRow>
                </div>
            </div>
          </CCardBody>
        </CCard>
      </div>

      <!-- Propositions / Suggestions Section -->
      <div class="section-title-wrapper mb-3 d-flex align-items-center">
        <div class="section-badge text-warning mr-3">SECTION 03</div>
        <h3 class="section-main-title">Student Suggestions & Propositions</h3>
      </div>
      
      <CCard class="competency-card border-0 mb-5 shadow-sm">
        <CCardBody class="p-4">
             <div v-for="item in suggestionItems" :key="item._id" class="mb-4">
                  <h5 class="competency-title mb-3">{{ translate(item.title) }}</h5>
                  <div v-for="(q, qIdx) in item.config" :key="qIdx" class="mb-3">
                      <label class="font-weight-bold text-muted small mb-2">{{ translate(q.question) }}</label>
                      <CTextarea 
                        rows="3" 
                        class="form-control-modern" 
                        placeholder="Write your suggestions here..."
                        v-model="evaluation.suggestions[item._id + '_' + qIdx]"
                      />
                  </div>
             </div>
        </CCardBody>
      </CCard>

      <!-- Centered Submit Button -->
      <div class="submit-section-container d-flex flex-column align-items-center mt-5 mb-5 pt-4">
        <CButton 
            color="danger" 
            size="lg" 
            class="px-5 py-3 font-weight-bold shadow-lg btn-submit-evaluation rounded-pill mb-3"
            @click="submitEvaluation"
            :disabled="isSubmitting"
        >
          <CIcon v-if="isSubmitting" name="cil-sync" class="mr-2 spin-icon" />
          <CIcon v-else name="cil-check-alt" class="mr-2" />
          {{ isSubmitting ? 'SUBMITTING...' : 'COMPLETE ASSESSMENT & SUBMIT' }}
        </CButton>
        <p class="text-muted small">By clicking submit, you confirm that all ratings provided are accurate.</p>
      </div>

    </CContainer>

    <!-- Success Modal -->
    <CModal
      title="Assessment Complete"
      color="success"
      :show.sync="showSuccessModal"
      centered
      fade
      :closeOnBackdrop="false"
    >
      <div class="text-center py-4">
        <div class="success-icon-large mb-3">
            <CIcon name="cil-check-circle" size="xl" class="text-success" />
        </div>
        <h3 class="font-weight-bold">Success!</h3>
        <p class="text-muted">The evaluation for <strong>{{ displayName }}</strong> has been submitted successfully.</p>
      </div>
      <template #footer>
        <CButton color="success" class="px-5 py-2 font-weight-bold rounded-pill" @click="onCloseSuccess">Exit to Dashboard</CButton>
      </template>
    </CModal>

  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import CompetenciesHeader from '@/projects/components/Layout/CompetenciesHeader.vue'
import RatingSelector from '@/projects/components/Util/RatingSelector.vue'
import FormNavbar from '@/projects/components/Layout/FormNavbar.vue'
import StudentAssessmentHeader from '@/projects/components/Layout/StudentAssessmentHeader.vue'

export default {
  name: 'FillForm',
  components: {
    CompetenciesHeader,
    RatingSelector,
    FormNavbar,
    StudentAssessmentHeader
  },
  data() {
    return {
      studentID: null,
      studentDoc: null,
      evaluation: {
        softskills: {},
        hardskills: {},
        suggestions: {}
      },
      isSubmitting: false,
      showSuccessModal: false
    }
  },
  async created() {
    this.studentID = this.$route.query.studentID;
    this.fetchGeneral()
    this.fetchSpecific()
    this.fetchProposition()
    
    if (this.studentID) {
        this.fetchStudentInfo();
    }
  },
  computed: {
    ...mapState('competencies/general', ['general']),
    ...mapState('competencies/specific', ['specific']),
    ...mapState('competencies/proposition', ['proposition']),
    ...mapState('member/students', ['students']),
    softskillItems() { return this.general ? this.general.filter(i => i.active) : [] },
    hardskillItems() { return this.specific ? this.specific.filter(i => i.active) : [] },
    suggestionItems() { return this.proposition ? this.proposition.filter(i => i.active) : [] },
    translate() {
      return (data, key = 'th') => {
        if (!data || !Array.isArray(data)) return data
        const found = data.find(i => i.key === key)
        return found ? found.value : (data[0] ? data[0].value : '')
      }
    },
    displayName() {
        if (!this.studentDoc) return 'Student Assessment';
        const lang = this.$store.getters['setting/lang'] || 'th';
        return this.translate(this.studentDoc.name, lang);
    },
    schoolInfo() {
        if (!this.studentDoc?.info?.school) return 'N/A';
        const lang = this.$store.getters['setting/lang'] || 'th';
        return this.translate(this.studentDoc.info.school.title || this.studentDoc.info.school.name, lang);
    },
    programInfo() {
        if (!this.studentDoc?.info?.program) return 'N/A';
        const lang = this.$store.getters['setting/lang'] || 'th';
        return this.translate(this.studentDoc.info.program.title || this.studentDoc.info.program.name, lang);
    },
    yearInfo() {
        return this.studentDoc?.info?.year || 'N/A';
    },
    semesterInfo() {
        return this.studentDoc?.info?.semester || 'N/A';
    }
  },
  methods: {
    ...mapActions('competencies/general', { fetchGeneral: 'general' }),
    ...mapActions('competencies/specific', { fetchSpecific: 'specific' }),
    ...mapActions('competencies/proposition', { fetchProposition: 'proposition' }),
    ...mapActions('competencies/evaluation', ['createEvaluation']),
    
    async fetchStudentInfo() {
        try {
            const resp = await this.$store.dispatch('member/students/students', { id: this.studentID });
            // Assume the response or state update gives us the student
            this.studentDoc = this.students.find(s => s._id === this.studentID);
        } catch (e) {
            console.error("Failed to fetch student info", e);
        }
    },

    async submitEvaluation() {
        if (!this.studentID) {
            alert("Error: No student ID provided for this evaluation.");
            return;
        }

        // 1. Calculate Completion
        let totalQuestions = 0;
        this.softskillItems.forEach(i => totalQuestions += (i.config || []).length);
        this.hardskillItems.forEach(i => totalQuestions += (i.config || []).length);
        
        const softRated = Object.keys(this.evaluation.softskills).length;
        const hardRated = Object.keys(this.evaluation.hardskills).length;
        
        if ((softRated + hardRated) < totalQuestions) {
            if (!confirm('You have not rated all competency criteria. Are you sure you want to submit the assessment anyway?')) return;
        }

        this.isSubmitting = true;

        try {
            // 2. Transform evaluation data for backend (Competencies_Evaluation schema)
            const payload = {
                studentId: this.studentID,
                softskills: Object.keys(this.evaluation.softskills).map(key => {
                    const [id] = key.split('_');
                    return { criteriaId: id, score: this.evaluation.softskills[key] };
                }),
                hardskills: Object.keys(this.evaluation.hardskills).map(key => {
                    const [id] = key.split('_');
                    return { criteriaId: id, score: this.evaluation.hardskills[key] };
                }),
                suggestions: Object.keys(this.evaluation.suggestions).map(key => {
                    const [id] = key.split('_');
                    return { criteriaId: id, value: this.evaluation.suggestions[key] };
                })
            };

            await this.createEvaluation(payload);
            this.showSuccessModal = true;
        } catch (error) {
            console.error('Submission failed', error);
            alert('Failed to submit evaluation. Please try again.');
        } finally {
            this.isSubmitting = false;
        }
    },

    onCloseSuccess() {
        this.showSuccessModal = false;
        this.$router.push('/dashboard');
    }
  }
}
</script>

<style scoped>
.fill-form-page {
  background-color: #f8fafc;
  min-height: 100vh;
}

.unified-header-container {
  margin-top: 0;
}

.profile-overlap-container {
  margin-top: -80px;
  position: relative;
  z-index: 50;
}

.guidelines-info-card {
  border-left: 5px solid #3b82f6;
  border-radius: 16px;
}

.info-icon {
  background: #eff6ff;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.section-badge {
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 1.5px;
  padding: 4px 10px;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.05);
}

.section-main-title {
  font-size: 22px;
  font-weight: 800;
  color: #1e293b;
  margin-bottom: 0;
}

.competency-container-card {
    border-radius: 20px;
    overflow: hidden;
}

.bg-light-soft { background-color: #fff1f2; }
.bg-light-spec { background-color: #f0fdf4; }

.question-row {
    transition: background 0.2s;
}

.question-row:hover {
    background-color: #f8fafc;
}

.border-bottom-dashed {
    border-bottom: 1px dashed #e2e8f0;
}

.q-marker {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    background: #f1f5f9;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 13px;
    font-weight: 800;
}

.q-category {
    font-size: 10px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 1.2px;
    color: #be123c;
}

.q-text {
    font-size: 15px;
    font-weight: 600;
    color: #334155;
    line-height: 1.5;
}

.btn-submit-evaluation {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.btn-submit-evaluation:hover:not(:disabled) {
  transform: translateY(-8px);
  box-shadow: 0 20px 40px -8px rgba(220, 38, 38, 0.4) !important;
}

.success-icon-large {
  transform: scale(3.5);
  margin: 40px 0;
}

.form-control-modern {
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 16px;
    background: #f8fafc;
    transition: all 0.3s;
}

.form-control-modern:focus {
    background: white;
    border-color: #dc2626;
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1);
    outline: none;
}

.spin-icon {
  animation: fa-spin 1.5s infinite linear;
}

@keyframes fa-spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(359deg); }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(30px); }
  to { opacity: 1; transform: translateY(0); }
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out 0.2s forwards;
  opacity: 0;
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
