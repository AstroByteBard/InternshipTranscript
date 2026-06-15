<template>
  <div class="c-app fill-form-page">
    <!-- Page Loading Overlay -->
    <transition name="fade">
      <div v-if="pageLoading" class="page-loading-overlay">
        <div class="loader-content">
          <div class="modern-spinner mb-4"></div>
          <h4 class="font-weight-bold text-dark mb-2">{{ $t('preparing_assessment') }}</h4>
          <p class="text-muted">{{ $t('please_wait_loading') }}</p>
        </div>
      </div>
    </transition>

    <CWrapper v-if="!pageLoading">
      <!-- Sticky Navigation -->
      <FormNavbar :studentName="displayName" :studentID="studentIdDisplay || 'Student'" />
      <div class="c-body">
        <main class="c-main">
          <CContainer fluid class="px-4 content-body animate-fade-in">

            <StudentAssessmentHeader v-if="studentDoc" :studentName="displayName" :studentID="studentIdDisplay"
              :schoolName="schoolInfo" :programName="programInfo" :academicYear="yearInfo" :semester="semesterInfo" />
            <!-- Case 1: Assessment Already Completed (Locked State) -->
            <transition name="fade">
              <div v-if="isAlreadySubmitted && !isPreview" class="locked-hero-container py-5 mt-4">
                <CCard class="border-0 shadow-lg text-center p-5 rounded-xl">
                  <CCardBody>
                    <div class="locked-icon-wrapper mb-4">
                      <CIcon name="cil-check-circle" size="xl" class="text-success success-icon-animate" />
                    </div>
                    <h1 class="display-4 font-weight-bold mb-3" style="color: #1e293b;">{{ $t('assessment_completed') }}
                    </h1>
                    <h4 class="text-muted mb-4 px-lg-5">
                      {{ $t('please_rate_student') }}
                    </h4>
                  </CCardBody>
                </CCard>
              </div>

              <!-- Case 2: Fresh Assessment Form (Default State) -->
              <div v-else>
                <!-- Instructions & Description -->
                <div
                  class="assessment-intro-card mb-5 p-4 rounded-xl shadow-sm border-0 bg-white d-flex align-items-center">
                  <div class="intro-icon-wrapper mr-4">
                    <CIcon name="cil-info" size="xl" class="text-danger" />
                  </div>
                  <div>
                    <h5 class="font-weight-bold mb-1">{{ $t('assessment_instructions') }}</h5>
                    <p class="text-muted mb-0 small">{{ $t('please_rate_student') }}</p>
                  </div>
                </div>

                <!-- Preview Filters -->
                <transition name="fade">
                  <CCard v-if="isPreview"
                    class="preview-filters-card mb-5 border-0 shadow-sm rounded-xl overflow-hidden">
                    <CCardHeader class="bg-light-info border-0 py-3 d-flex align-items-center">
                      <CIcon name="cil-filter" class="mr-2 text-info" />
                      <span class="font-weight-bold text-uppercase small letter-spacing-1 text-info">{{
                        $t('assessment_preview_configuration') }}</span>
                    </CCardHeader>
                    <CCardBody class="bg-white p-4">
                      <p class="text-muted small mb-4">Select a School and Major to preview its specific hardskill
                        assessment criteria.</p>
                      <CRow>
                        <CCol md="6" class="mb-3 mb-md-0">
                          <label class="small font-weight-bold text-muted mb-2">{{ $t('select_a_school') }}</label>
                          <CSelect :options="schoolOptions" :value.sync="previewSchool"
                            :placeholder="$t('please_select_a_school')" class="modern-select-input" />
                        </CCol>
                        <CCol md="6">
                          <label class="small font-weight-bold text-muted mb-2">{{ $t('major_program') }}</label>
                          <CSelect :options="majorOptions" :value.sync="previewMajor"
                            :placeholder="$t('select_a_major_first')" :disabled="!previewSchool"
                            class="modern-select-input" />
                        </CCol>
                      </CRow>
                    </CCardBody>
                  </CCard>
                </transition>

                <!-- Softskills Section -->
                <div class="section-title-wrapper mb-3 d-flex align-items-center">
                  <div class="section-badge text-danger mr-3">{{ $t('section_01') }}</div>
                  <h3 class="section-main-title">{{ $t('general_competencies_softskills') }}</h3>
                </div>

                <div class="competency-list mb-5">
                  <CCard v-for="(item, idx) in softskillItems" :key="item._id"
                    class="competency-container-card border-0 mb-4 shadow-sm">
                    <CCardBody class="p-0">
                      <div class="competency-header p-4 border-bottom bg-light-soft">
                        <div class="d-flex align-items-center">
                          <div class="item-number mr-3">{{ String(idx + 1).padStart(2, '0') }}</div>
                          <h5 class="competency-title mb-0">{{ translate(item.title) }}</h5>
                        </div>
                      </div>
                      <div class="question-items-wrapper">
                        <div v-for="(conf, cIdx) in (item.config || [])" :key="cIdx"
                          class="question-row p-4 border-bottom-dashed">
                          <CRow class="align-items-center">
                            <CCol lg="7" md="6" class="mb-3 mb-md-0">
                              <div class="d-flex align-items-start">
                                <div class="q-marker mr-3">{{ cIdx + 1 }}</div>
                                <div>
                                  <div class="q-category mb-1" v-if="conf.label || conf.variable">{{
                                    translate(conf.label || conf.variable) }}</div>
                                  <div class="q-text">{{ translate(conf.question) }}</div>
                                </div>
                              </div>
                            </CCol>
                            <CCol lg="5" md="6">
                              <RatingSelector v-model="evaluation.softskills[item._id + '_' + cIdx]"
                                :disabled="isAlreadySubmitted || isPreview" />
                            </CCol>
                          </CRow>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </div>

                <!-- Hardskills Section -->
                <div class="section-title-wrapper mb-3 d-flex align-items-center">
                  <div class="section-badge text-success mr-3">{{ $t('section_02') }}</div>
                  <h3 class="section-main-title">{{ $t('program_specific_hardskills') }}</h3>
                </div>

                <div class="competency-list mb-5">
                  <CCard v-for="(item, idx) in hardskillItems" :key="item._id"
                    class="competency-container-card border-0 mb-4 shadow-sm">
                    <CCardBody class="p-0">
                      <div class="competency-header p-4 border-bottom bg-light-spec">
                        <div class="d-flex align-items-center">
                          <div class="item-number mr-3">{{ String(idx + 1).padStart(2, '0') }}</div>
                          <div>
                            <h5 class="competency-title mb-1">{{ translate(item.title) }}</h5>
                            <CBadge color="light" class="border text-muted px-2 py-1">{{ item.program ?
                              translate(item.program.title) : 'General' }}</CBadge>
                          </div>
                        </div>
                      </div>
                      <div class="question-items-wrapper">
                        <div v-for="(conf, cIdx) in (item.config || [])" :key="cIdx"
                          class="question-row p-4 border-bottom-dashed">
                          <CRow class="align-items-center">
                            <CCol lg="7" md="6" class="mb-3 mb-md-0">
                              <div class="d-flex align-items-start">
                                <div class="q-marker mr-3 text-success">{{ cIdx + 1 }}</div>
                                <div>
                                  <div class="q-category mb-1 text-success" v-if="conf.label || conf.variable">{{
                                    translate(conf.label || conf.variable) }}</div>
                                  <div class="q-text">{{ translate(conf.question) }}</div>
                                </div>
                              </div>
                            </CCol>
                            <CCol lg="5" md="6">
                              <RatingSelector v-model="evaluation.hardskills[item._id + '_' + cIdx]"
                                :disabled="isAlreadySubmitted || isPreview" />
                            </CCol>
                          </CRow>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </div>

                <!-- Suggestions Section -->
                <div class="section-title-wrapper mb-3 d-flex align-items-center">
                  <div class="section-badge text-info mr-3">{{ $t('section_03') }}</div>
                  <h3 class="section-main-title">{{ $t('continuous_improvement_suggestions') }}</h3>
                </div>

                <div class="suggestions-list mb-5">
                  <CCard v-for="(item, idx) in suggestionItems" :key="item._id"
                    class="competency-container-card border-0 mb-4 shadow-sm">
                    <CCardBody class="p-0">
                      <div class="competency-header p-4 border-bottom bg-light-info">
                        <div class="d-flex align-items-center">
                          <div class="item-number mr-3">{{ String(idx + 1).padStart(2, '0') }}</div>
                          <h5 class="competency-title mb-0">{{ translate(item.title) }}</h5>
                        </div>
                      </div>
                      <div class="question-items-wrapper">
                        <div v-for="(q, qIdx) in (item.config || [])" :key="qIdx"
                          class="question-row p-4 border-bottom-dashed">
                          <div class="mb-2">
                            <div class="d-flex align-items-start mb-3">
                              <div class="q-marker mr-3 text-info">{{ qIdx + 1 }}</div>
                              <div>
                                <div class="q-category mb-1 text-info" v-if="q.label || q.variable">{{ translate(q.label
                                  || q.variable) }}</div>
                                <div class="q-text">{{ translate(q.question) }}</div>
                              </div>
                            </div>
                            <CInput rows="4" class="form-control-modern"
                              :placeholder="$t('write_your_suggestions_here')"
                              v-model="evaluation.suggestions[item._id + '_' + qIdx]"
                              :disabled="isAlreadySubmitted || isPreview" />
                          </div>
                        </div>
                      </div>
                    </CCardBody>
                  </CCard>
                </div>

                <!-- Centered Submit Button -->
                <div class="submit-section-container d-flex flex-column align-items-center mt-5 mb-5 pt-4">
                  <div class="d-flex justify-content-center py-5">
                    <CButton color="danger" size="lg"
                      class="px-5 py-3 font-weight-bold shadow btn-submit-evaluation rounded-pill"
                      :disabled="isSubmitting || isAlreadySubmitted || isPreview" @click="submitEvaluation">
                      <CIcon v-if="isSubmitting" name="cil-reload" class="mr-2 spin-icon" />
                      <CIcon v-else-if="isAlreadySubmitted" name="cil-lock-locked" class="mr-2" />
                      <CIcon v-else name="cil-check-circle" class="mr-2" />
                      {{ isSubmitting ? $t('submitting') : (isAlreadySubmitted ? $t('evaluation_submitted') : (isPreview
                        ?
                        $t('form_preview_mode') : $t('submit_evaluation'))) }}
                    </CButton>
                  </div>
                  <p class="text-muted small">{{ $t('by_clicking_submit_confirm') }}</p>
                </div>
              </div>
            </transition>
          </CContainer>
        </main>
      </div>
    </CWrapper>

    <!-- Success Modal -->
    <CModal title="Assessment Complete" color="success" :show.sync="showSuccessModal" centered fade
      :closeOnBackdrop="false" size="sm">
      <div class="text-center py-5 px-4">
        <div class="success-icon-wrapper mb-4">
          <CIcon name="cil-check-circle" class="text-success success-icon-animate" />
        </div>
        <h2 class="font-weight-bold mb-3" style="color: #1e293b;">Success!</h2>
        <p class="text-muted leading-relaxed mb-0">
          The evaluation for <br>
          <strong class="text-dark">{{ displayName }}</strong> <br>
          has been submitted successfully.
        </p>
      </div>
      <template #footer>
        <div class="w-100 d-flex justify-content-center pb-4">
          <CButton color="success" class="px-5 py-2 font-weight-bold rounded-pill shadow-sm btn-exit-dashboard"
            @click="onCloseSuccess">
            Exit to Dashboard
          </CButton>
        </div>
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
      previewSchool: '',
      previewMajor: '',
      schools: [],
      programs: [],
      isSubmitting: false,
      showSuccessModal: false,
      isAlreadySubmitted: false,
      isPreview: false,
      pageLoading: true
    }
  },
  async created() {
    this.pageLoading = true;

    // Debug info for preview mode initialization
    console.log('Assessment Form Initializing...');
    console.log('Mode:', this.$route.query.mode);
    console.log('Method availability check:', {
      fetchSchools: typeof this.fetchSchools === 'function' ? 'Found' : 'MISSING',
      fetchPrograms: typeof this.fetchPrograms === 'function' ? 'Found' : 'MISSING'
    });

    // Ensure studentID is set from the route query
    if (this.$route.query.studentID) {
      this.studentID = this.$route.query.studentID;
    }

    if (this.$route.query.mode === 'preview') {
      this.isPreview = true;

      // Use a slight delay to ensure methods are bound if there's any weird timing issue
      this.$nextTick(() => {
        if (typeof this.fetchSchools === 'function') this.fetchSchools();
        if (typeof this.fetchPrograms === 'function') this.fetchPrograms();
      });
    }

    try {
      const promises = [
        this.fetchGeneral(),
        this.fetchSpecific(),
        this.fetchProposition()
      ];

      if (this.studentID) {
        promises.push(this.fetchStudentInfo());
        promises.push(this.checkExistingEvaluation());
      }

      await Promise.all(promises);
    } catch (e) {
      console.error("Initialization error", e);
    } finally {
      setTimeout(() => { this.pageLoading = false; }, 600); // Small delay for smooth transition
    }
  },
  computed: {
    ...mapState('competencies/general', ['general']),
    ...mapState('competencies/specific', ['specific']),
    ...mapState('competencies/proposition', ['proposition']),
    ...mapState('member/students', ['students']),
    softskillItems() { return this.general ? this.general.filter(i => i.active) : [] },
    hardskillItems() {
      if (!this.specific) return []
      let items = this.specific.filter(i => i.active)

      // Filter by selection if in preview mode
      if (this.isPreview && this.previewMajor) {
        items = items.filter(item => {
          const majorId = item.program?._id || item.program
          return majorId === this.previewMajor
        })
      }
      // Filter by student program if not in preview or no selection
      else if (this.studentDoc?.info?.program?._id) {
        const studentMajorId = this.studentDoc.info.program._id;
        items = items.filter(item => {
          const majorId = item.program?._id || item.program
          return majorId === studentMajorId
        })
      }

      return items
    },
    suggestionItems() { return this.proposition ? this.proposition.filter(i => i.active) : [] },
    translate() {
      return (data, key) => {
        if (!data || !Array.isArray(data)) return data
        const lang = key || this.$store.getters['setting/lang'] || this.$i18n?.locale || 'th'
        const found = data.find(i => i.key === lang)
        return found ? found.value : (data[0] ? data[0].value : '')
      }
    },

    studentIdDisplay() {
      // Prefer human-readable studentID (student.studentID) over route/_id
      return this.studentDoc?.studentID || this.studentID || ''
    },
    schoolOptions() {
      return [
        { value: '', label: 'All Schools' },
        ...this.schools.map(s => ({
          value: s._id,
          label: this.translate(s.title)
        }))
      ]
    },
    majorOptions() {
      let filtered = this.programs
      if (this.previewSchool) {
        filtered = filtered.filter(p => {
          const schoolId = p.school?._id || p.school
          return schoolId === this.previewSchool
        })
      }
      return [
        { value: '', label: 'All Majors' },
        ...filtered.map(p => ({
          value: p._id,
          label: this.translate(p.title)
        }))
      ]
    },
    displayName() {
      if (this.isPreview) return 'Assessment Form Preview';
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
      const yr = this.studentDoc?.info?.year;
      if (Array.isArray(yr)) {
        const found = yr.find(y => y.key === 'en') || yr[0];
        return found ? found.value : 'N/A';
      }
      if (yr && typeof yr === 'object') return yr.value || 'N/A';
      return yr || 'N/A';
    },
    semesterInfo() {
      const sem = this.studentDoc?.info?.semester;
      if (!sem) return 'N/A';
      if (typeof sem === 'object' && sem.title && Array.isArray(sem.title)) {
        const lang = this.$i18n.locale || 'en';
        const found = sem.title.find(t => t.key === lang) || sem.title.find(t => t.key === 'en') || sem.title[0];
        return found ? found.value : 'N/A';
      }
      return 'N/A';
    }
  },
  methods: {
    // 1. Vuex Actions
    ...mapActions('competencies/general', { fetchGeneral: 'general' }),
    ...mapActions('competencies/specific', { fetchSpecific: 'specific' }),
    ...mapActions('competencies/proposition', { fetchProposition: 'proposition' }),
    ...mapActions('competencies/evaluation', {
      createEvaluation: 'createEvaluation',
      queryEvaluation: 'queryEvaluation',
      fetchEvaluations: 'evaluations'
    }),
    ...mapActions('member/students', { fetchDetail: 'detail' }),

    // 2. Custom Data Fetching
    fetchSchools() {
      console.log('Dispatching fetchSchools...');
      return this.$store.dispatch('academic/schools/schools').then(() => {
        this.schools = this.$store.state.academic.schools.schools || [];
        console.log('Schools loaded:', this.schools.length);
      }).catch(e => console.error('Error in fetchSchools:', e));
    },

    fetchPrograms() {
      console.log('Dispatching fetchPrograms...');
      return this.$store.dispatch('academic/programs/programs').then(() => {
        this.programs = this.$store.state.academic.programs.programs || [];
        console.log('Programs loaded:', this.programs.length);
      }).catch(e => console.error('Error in fetchPrograms:', e));
    },

    // 3. Validation & Status Checks
    async checkExistingEvaluation() {
      if (!this.studentID) return;
      try {
        const resp = await this.fetchEvaluations({ studentId: this.studentID });
        if (resp && resp.data && resp.data.length > 0) {
          this.isAlreadySubmitted = true;
        }
      } catch (e) {
        console.error("Error checking existing evaluation", e);
      }
    },

    async fetchStudentInfo() {
      try {
        const students = await this.$store.dispatch('member/students/students', { id: this.studentID });
        if (students && Array.isArray(students)) {
          this.studentDoc = students.find(s => s._id === this.studentID);
        }
      } catch (e) {
        console.error("Failed to fetch student info", e);
      }
    },

    // 4. Submission Logic
    async submitEvaluation() {
      if (this.isSubmitting || this.isAlreadySubmitted || this.isPreview) return;

      this.isSubmitting = true;

      if (!this.studentID || !this.studentDoc) {
        alert("Error: Verification failed. Please refresh the page.");
        this.isSubmitting = false;
        return;
      }

      // Validate Completion
      let totalQuestions = 0;
      this.softskillItems.forEach(i => totalQuestions += (i.config || []).length);
      this.hardskillItems.forEach(i => totalQuestions += (i.config || []).length);

      const softRated = Object.keys(this.evaluation.softskills).length;
      const hardRated = Object.keys(this.evaluation.hardskills).length;

      if ((softRated + hardRated) < totalQuestions) {
        if (!confirm('You have not rated all competency criteria. Are you sure you want to submit?')) {
          this.isSubmitting = false;
          return;
        }
      }

      try {
        const payload = {
          studentId: this.studentID,
          softskills: Object.keys(this.evaluation.softskills).map(key => {
            const [id, cIdx] = key.split('_');
            const category = this.softskillItems.find(i => i._id === id);
            const config = category && category.config ? category.config[parseInt(cIdx)] : null;
            return {
              answer: {
                title: {
                  th: this.translate(category ? category.title : '', 'th') + ' - ' + this.translate(config ? config.label : '', 'th'),
                  en: this.translate(category ? category.title : '', 'en') + ' - ' + this.translate(config ? config.label : '', 'en')
                },
                score: this.evaluation.softskills[key]
              }
            };
          }),
          hardskills: Object.keys(this.evaluation.hardskills).map(key => {
            const [id, cIdx] = key.split('_');
            const category = this.hardskillItems.find(i => i._id === id);
            const config = category && category.config ? category.config[parseInt(cIdx)] : null;
            return {
              answer: {
                title: {
                  th: this.translate(category ? category.title : '', 'th') + ' - ' + this.translate(config ? config.label : '', 'th'),
                  en: this.translate(category ? category.title : '', 'en') + ' - ' + this.translate(config ? config.label : '', 'en')
                },
                score: this.evaluation.hardskills[key]
              }
            };
          }),
          sugestion: Object.keys(this.evaluation.suggestions).map(key => {
            const [id, cIdx] = key.split('_');
            const category = this.suggestionItems.find(i => i._id === id);
            const config = category && category.config ? category.config[parseInt(cIdx)] : null;
            return {
              answer: {
                title: {
                  th: this.translate(category ? category.title : '', 'th') + ' - ' + this.translate(config ? config.label : '', 'th'),
                  en: this.translate(category ? category.title : '', 'en') + ' - ' + this.translate(config ? config.label : '', 'en')
                },
                value: this.evaluation.suggestions[key]
              }
            };
          })
        };

        await this.createEvaluation(payload);
        this.isAlreadySubmitted = true;
        this.showSuccessModal = true;
      } catch (error) {
        console.error('Submission failed', error);
        if (error?.response?.status === 400) {
          this.isAlreadySubmitted = true;
          return;
        }
        alert('Failed to submit evaluation. Please try again.');
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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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

.bg-light-soft {
  background-color: #fff1f2;
}

.bg-light-spec {
  background-color: #f0fdf4;
}

.bg-light-info {
  background-color: #f0f9ff;
}

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

.success-icon-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-icon-wrapper .c-icon {
  width: 80px;
  height: 80px;
}

.success-icon-animate {
  animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
}

@keyframes scaleIn {
  from {
    transform: scale(0);
    opacity: 0;
  }

  to {
    transform: scale(1);
    opacity: 1;
  }
}

.btn-exit-dashboard {
  transition: all 0.3s;
}

.btn-exit-dashboard:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px -5px rgba(16, 185, 129, 0.4) !important;
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
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(359deg);
  }
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(30px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.6s ease-out 0.2s forwards;
  opacity: 0;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Page Loading Overlay */
.page-loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: white;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.modern-spinner {
  width: 60px;
  height: 60px;
  border: 4px solid #f3f4f6;
  border-top: 4px solid #dc2626;
  border-radius: 50%;
  margin: 0 auto;
  animation: spin 1s cubic-bezier(0.55, 0.055, 0.675, 0.19) infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Locked State UI */
.locked-hero-container {
  max-width: 800px;
  margin: 0 auto;
}

.locked-icon-wrapper .c-icon {
  width: 120px;
  height: 120px;
  color: #10b981;
}

.divider-small {
  width: 60px;
  height: 4px;
  background: #10b981;
  border-radius: 2px;
}

.rounded-xl {
  border-radius: 24px !important;
}

.leading-relaxed {
  line-height: 1.625;
}

/* Preview Filters Styling */
.preview-filters-card {
  border: 1px solid rgba(0, 123, 255, 0.1) !important;
  animation: slideIn 0.5s ease-out;
}

.modern-select-input /deep/ .custom-select,
.modern-select-input /deep/ .form-control {
  border-radius: 12px !important;
  height: 48px !important;
  border: 1px solid #e2e8f0 !important;
  background-color: #f8fafc !important;
  font-weight: 500 !important;
  transition: all 0.3s !important;
}

.modern-select-input /deep/ .custom-select:focus,
.modern-select-input /deep/ .form-control:focus {
  border-color: #3b82f6 !important;
  background-color: white !important;
  box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1) !important;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }

  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}
</style>
