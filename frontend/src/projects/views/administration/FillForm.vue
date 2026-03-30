<template>
  <div class="fill-form-page pb-5 h-100 overflow-auto">
    <CContainer fluid class="px-4 mt-n3 animate-fade-in">
      <!-- Intro Card -->
      <CCard class="form-intro-card border-0 shadow-sm mb-4">
        <CCardBody class="p-4 d-flex align-items-center">
          <div class="intro-icon-wrapper mr-4">
            <CIcon name="cil-notes" size="xl" class="text-danger" />
          </div>
          <div>
            <h4 class="font-weight-bold mb-1" style="color: #1e293b;">Evaluation Guidelines</h4>
            <p class="text-muted mb-0" style="font-size: 14px;">
              Please rate each competency based on your current internship performance. 
              A score of 1 indicates significant improvement is needed, while 5 represents excellence.
            </p>
          </div>
        </CCardBody>
      </CCard>

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

      <!-- Footer Actions -->
      <div class="form-footer-actions d-flex justify-content-between align-items-center mb-5 mt-4">
        <CButton @click="$router.push('/competencies')" variant="ghost" class="btn-modern-back px-4">
            <CIcon name="cil-arrow-left" class="mr-2" /> Back to Competencies
        </CButton>
        <CButton @click="submitEvaluation" color="danger" class="btn-modern-submit px-5 py-3 font-weight-bold shadow">
            <CIcon name="cil-check-alt" class="mr-2" /> Submit Evaluation Form
        </CButton>
      </div>
    </CContainer>
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import CompetenciesHeader from '@/projects/components/Layout/CompetenciesHeader.vue'
import RatingSelector from '@/projects/components/Util/RatingSelector.vue'

export default {
  name: 'FillForm',
  components: {
    CompetenciesHeader,
    RatingSelector
  },
  data() {
    return {
      evaluation: {
        softskills: {},
        hardskills: {},
        suggestions: {}
      }
    }
  },
  created() {
    this.fetchSoftskills()
    this.fetchHardskills()
    this.fetchSuggestions()
  },
  computed: {
    ...mapState('competencies/general', ['general']),
    ...mapState('competencies/specific', ['specific']),
    ...mapState('competencies/proposition', ['proposition']),
    softskillItems() { return this.general ? this.general.filter(i => i.active) : [] },
    hardskillItems() { return this.specific ? this.specific.filter(i => i.active) : [] },
    suggestionItems() { return this.proposition ? this.proposition.filter(i => i.active) : [] },
    translate() {
      return (data, key = 'th') => {
        if (!data || !Array.isArray(data)) return data
        const found = data.find(i => i.key === key)
        return found ? found.value : (data[0] ? data[0].value : '')
      }
    }
  },
  methods: {
    ...mapActions('competencies/general', ['fetchSoftskills']),
    ...mapActions('competencies/specific', ['fetchHardskills']),
    ...mapActions('competencies/proposition', ['fetchSuggestions']),
    onExport() {
        alert('Export logic would go here.');
    },
    async submitEvaluation() {
        // Basic validation: Check if every config item has a rating
        let totalQuestions = 0;
        this.softskillItems.forEach(i => totalQuestions += (i.config || []).length);
        this.hardskillItems.forEach(i => totalQuestions += (i.config || []).length);
        
        const softRated = Object.keys(this.evaluation.softskills).length;
        const hardRated = Object.keys(this.evaluation.hardskills).length;
        
        if ((softRated + hardRated) < totalQuestions) {
            if (!confirm('You have not rated all competency criteria. Are you sure you want to submit?')) return;
        }

        try {
            console.log('Submitting detailed evaluation:', this.evaluation);
            // API Call placeholder
            alert('Assessment submitted successfully!');
            this.$router.push('/competencies');
        } catch (error) {
            console.error('Submission failed', error);
            alert('Failed to submit evaluation. Please try again.');
        }
    }
  }
}
</script>

<style scoped>
.fill-form-page {
  background-color: #f8fafc;
  min-height: 100vh;
}

.intro-icon-wrapper {
  width: 56px;
  height: 56px;
  background: #fff1f2;
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
  font-size: 20px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0;
}

.competency-card {
  border-radius: 16px;
  transition: all 0.3s ease;
}

.hover-lift:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 20px -5px rgba(0,0,0,0.1) !important;
}

.item-number {
  font-size: 18px;
  font-weight: 800;
  color: #e2e8f0;
  line-height: 1;
}

.competency-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
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

.question-row:last-child {
    border-bottom: none;
}

.q-marker {
    width: 28px;
    height: 28px;
    border-radius: 8px;
    background: #f1f5f9;
    color: #475569;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
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

.btn-modern-back {
    color: #64748b;
    font-weight: 600;
}

.btn-modern-back:hover {
    color: #1e293b;
    background: #f1f5f9;
}

.btn-modern-submit {
    border-radius: 14px;
    height: 54px;
    background: #dc2626 !important;
    border: none;
    transition: all 0.3s;
}

.btn-modern-submit:hover {
    background: #b91c1c !important;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px -5px rgba(220, 38, 38, 0.4) !important;
}

.form-control-modern {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 12px 16px;
    background: #f8fafc;
    transition: all 0.2s;
}

.form-control-modern:focus {
    background: white;
    border-color: #dc2626;
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.08);
    outline: none;
}

.animate-fade-in {
  animation: fadeIn 0.8s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>
