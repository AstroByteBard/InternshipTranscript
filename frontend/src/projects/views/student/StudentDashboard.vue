<template>
  <div class="student-dashboard">
    <!-- Hero Section -->
    <CRow class="mb-4">
      <CCol md="12">
        <CCard class="profile-hero-card border-0 shadow-sm">
          <CCardBody class="p-4 d-flex align-items-center justify-content-between flex-wrap">
            <div class="d-flex align-items-center">
              <div class="avatar-wrapper mr-4">
                <img :src="avatarSrc" class="hero-avatar shadow-lg" :alt="$t('student')" @error="onAvatarError">
              </div>
              <div class="hero-info">
                <h1 class="font-weight-bold mb-1 text-primary-dark">{{ studentData.name }}</h1>
                <p class="text-muted mb-2">
                  <CIcon name="cil-fingerprint" size="sm" class="mr-1" />
                  {{ $t('id_label') }}: {{ studentData.studentID }}
                </p>
                <div class="d-flex flex-wrap">
                  <CBadge color="light" class="badge-custom mr-2 mb-2">
                    <CIcon name="cil-bank" width="16" class="mr-1 text-muted-dark" />
                    {{ studentData.school }}
                  </CBadge>
                  <CBadge color="light" class="badge-custom mb-2">
                    <CIcon name="cil-school" width="16" class="mr-1 text-muted-dark" />
                    {{ studentData.program }}
                  </CBadge>
                </div>
              </div>
            </div>
            <div class="action-hub mt-3 mt-lg-0">
              <CButton color="primary" class="download-btn px-4 py-2 shadow-sm font-weight-bold"
                @click="openDownloadModal">
                <CIcon name="cil-cloud-download" class="mr-2" /> {{ $t('download_performance_report') }}
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
            <h4 class="mb-0 text-secondary-dark font-weight-bold">{{ $t('soft_skill') }}</h4>
            <p class="small text-muted mb-0">{{ $t('general_competencies_behavioural_analysis') }}</p>
          </CCardHeader>
          <CCardBody class="px-4 pb-4">
            <div class="chart-container mb-4 d-flex justify-content-center"
              style="width:460px;height:460px;max-width:100%;margin:0 auto;">
              <CChartRadar ref="generalChart" :datasets="generalChartDatasets" :labels="generalChartLabels"
                :options="chartOptions" height="460px" style="width:460px;max-width:100%;" />
            </div>
            <div class="skills-list">
              <div v-for="skill in generalCompetencies" :key="skill.id" class="skill-item mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <span class="font-weight-bold text-small text-dark">{{ skill.name }}</span>
                  <span class="percent-number font-weight-bold text-small">{{ skill.percentage }}%</span>
                </div>
                <CProgress :value="skill.percentage" color="danger" class="progress-xs" />
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>

      <!-- Specific Competencies (Hard Skills) -->
      <CCol lg="6" class="mb-4">
        <CCard class="h-100 border-0 shadow-sm glass-card">
          <CCardHeader class="border-0 bg-transparent pt-4 px-4">
            <h4 class="mb-0 text-secondary-dark font-weight-bold">{{ $t('hard_skill') }}</h4>
            <p class="small text-muted mb-0">{{ $t('specific_technical_competencies_analysis') }}</p>
          </CCardHeader>
          <CCardBody class="px-4 pb-4">
            <div class="chart-container mb-4 d-flex justify-content-center"
              style="width:460px;height:460px;max-width:100%;margin:0 auto;">
              <CChartRadar ref="specificChart" :datasets="specificChartDatasets" :labels="specificChartLabels"
                :options="chartOptions" height="460px" style="width:460px;max-width:100%;" />
            </div>
            <div class="skills-list">
              <div v-for="skill in specificCompetencies" :key="skill.id" class="skill-item mb-3">
                <div class="d-flex justify-content-between mb-1">
                  <span class="font-weight-bold text-small text-dark">{{ skill.name }}</span>
                  <span class="percent-number font-weight-bold text-small">{{ skill.percentage }}%</span>
                </div>
                <CProgress :value="skill.percentage" color="danger" class="progress-xs" />
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
                    <CIcon name="cil-star" size="xl" />
                  </div>
                  <h5 class="mb-0 font-weight-bold">{{ $t('outstanding_performance') }}</h5>
                </div>
                <div v-if="Outstanding.length > 0">
                  <div v-for="feedback in Outstanding" :key="feedback.id" class="feedback-card p-3 mb-3">
                    <ul class="mb-0 custom-list">
                      <li v-for="(point, pIdx) in feedback.points" :key="pIdx" class="mb-2 text-muted-dark">
                        <template v-if="point && typeof point === 'object'">
                          <div v-if="point.title && (point.title[selectedLanguage] || point.title.en || point.title.th)"
                            class="font-weight-bold">
                            {{ (point.title[selectedLanguage] || point.title.en || point.title.th) }}
                          </div>
                          <div
                            v-if="point.content && (point.content[selectedLanguage] || point.content.en || point.content.th)"
                            class="text-small text-muted">
                            {{ (point.content[selectedLanguage] || point.content.en || point.content.th) }}
                          </div>
                          <div v-else-if="(point[selectedLanguage] || point.en || point.th)">
                            {{ (point[selectedLanguage] || point.en || point.th) }}
                          </div>
                        </template>
                        <template v-else>
                          {{ point }}
                        </template>
                      </li>
                    </ul>
                  </div>
                </div>
                <div v-else class="empty-state text-center py-4">
                  <p class="text-muted font-italic">{{ $t('analytical_feedback_processing') }}</p>
                </div>
              </CCol>
              <CCol md="6">
                <div class="d-flex align-items-center mb-4 text-info">
                  <div class="icon-circle bg-light-info mr-3">
                    <CIcon name="cil-chart-line" size="xl" />
                  </div>
                  <h5 class="mb-0 font-weight-bold">{{ $t('growth_opportunities') }}</h5>
                </div>
                <div v-if="Opportunities.length > 0">
                  <div v-for="feedback in Opportunities" :key="feedback.id" class="feedback-card p-3 mb-3">
                    <ul class="mb-0 custom-list">
                      <li v-for="(point, pIdx) in feedback.points" :key="pIdx" class="mb-2 text-muted-dark">
                        {{ typeof point === 'object' && point !== null ? (point[selectedLanguage || 'en'] || point.en ||
                          point.th ||
                          '') : point }}
                      </li>
                    </ul>
                  </div>
                </div>
                <div v-else class="empty-state text-center py-4">
                  <p class="text-muted font-italic">{{ $t('continue_excellent_progress') }}</p>
                </div>
              </CCol>
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Download Modal -->
    <CModal :title="$t('download_documentation')" :show.sync="showDownloadModal" centered color="primary" size="lg"
      class="download-modal-dialog">
      <div class="download-modal-body py-3 px-1 text-center">
        <CIcon name="cil-cloud-download" size="xl" class="text-primary mb-3" style="font-size: 3rem" />
        <h5 class="font-weight-bold mb-2">{{ $t('ready_to_download') }}</h5>
        <p class="text-muted small mb-4">{{ $t('select_report_template') }}</p>
        <div class="text-left px-2">
          <label class="font-weight-bold small text-uppercase text-muted mb-2">{{ $t('report_template') }}</label>
          <CSelect :options="publicDocumentOptions" :value.sync="selectedDocumentId"
            :placeholder="$t('select_a_template')" class="custom-select-modern" />
        </div>
      </div>
      <template #footer>
        <CButton @click="showDownloadModal = false" color="light" class="px-4 font-weight-bold">{{ $t('cancel') }}
        </CButton>
        <CButton @click="handleDownload" color="primary" class="px-4 font-weight-bold download-action-btn"
          :disabled="!selectedDocumentId">
          {{ $t('generate_pdf') }}
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { CChartRadar } from '@coreui/vue-chartjs';
import { downloadClientPDF } from '@/utils/pdfGenerator';
import { formatChartLabel } from '@/utils/chartLabel';

export default {
  name: 'StudentDashboard',
  components: {
    CChartRadar
  },
  created() {
    // ensure Chart plugin registered early if Chart.js is available
    try {
      // require here to avoid build-time issues if Chart is not present
      // eslint-disable-next-line global-require
      const Chart = require('chart.js');
      if (Chart && !Chart._drawScaleOnTopRegistered) {
        Chart.plugins.register({
          afterDatasetsDraw(chartInstance) {
            try {
              if (chartInstance.scale && typeof chartInstance.scale.draw === 'function') {
                chartInstance.scale.draw();
              }
            } catch (e) {
              // ignore
            }
          }
        });
        Chart._drawScaleOnTopRegistered = true;
      }
    } catch (e) {
      // Chart.js not available at create time — skip
    }
  },
  data() {
    return {
      targetStudentId: '',
      studentData: {
        name: '',
        studentID: '',
        school: '',
        program: '',
        picture: require('@/assets/avatars/Person.jpg')
      },
      // default avatar to use when student's picture is missing or fails to load
      defaultAvatar: require('@/assets/avatars/Person.jpg'),
      showDownloadModal: false,
      publicDocuments: [],
      selectedDocumentId: '',
      specificCompetencies: [],
      generalCompetencies: [],
      softAverages: [],
      hardAverages: [],
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
          position: 'top',
          labels: {
            usePointStyle: true,
            padding: 16,
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
            fontSize: 12,
            showLabelBackdrop: false, // ปิดพื้นหลังสีขาวเพื่อไม่ให้บังเส้นกราฟ
            padding: 36,               // เพิ่ม padding มากขึ้นเพื่อเลื่อนตัวเลขให้ออกมาจากตำแหน่งจุด

            // ใช้ callback เติมช่องว่างท้ายตัวเลขในกรณีที่ต้องการปรับตำแหน่งแนวนอน
            callback: function (value) {
              return value + '  ';
            }
          },
          pointLabels: {
            fontSize: 11,
            fontStyle: '600',
            fontColor: '#333',
            padding: 36 // เพิ่มค่า padding ของป้ายเพื่อผลักป้ายออกจากตัวเลข
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
    onAvatarError(e) {
      try {
        if (e && e.target) e.target.src = this.defaultAvatar;
      } catch (err) {
        // ignore
      }
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

      // Handle common scoring ranges robustly:
      // - Fractional (0.0 - 1.0) -> treat as 0-100%
      // - 1 - 5 scale -> map linearly so 1 => 20, 5 => 100
      // - 0 - 10 scale -> map linearly to 0-100
      // - 0 - 100 scale -> pass through
      if (num >= 0 && num < 1) return Math.round(num * 100);
      if (num >= 1 && num <= 5) return Math.round((num / 5) * 100);
      if (num > 5 && num <= 10) return Math.round((num / 10) * 100);
      if (num >= 0 && num <= 100) return Math.round(num);
      return Math.max(0, Math.min(100, Math.round(num)));
    },
    mapEvaluationList(list, lang = this.selectedLanguage || 'en') {
      if (!Array.isArray(list)) return [];
      return list.map((item, index) => {
        const raw = (item && item.answer && item.answer.score !== undefined) ? item.answer.score : (item && item.score !== undefined ? item.score : undefined);
        const rawNum = raw !== undefined && raw !== null ? Number(raw) : undefined;

        // Derive display name: prefer selectedLanguage -> alternative language -> criteriaId.
        const altLang = lang === 'en' ? 'th' : 'en';
        let rawTitle = (item?.answer?.title?.[lang]) || (item?.answer?.title?.[altLang]) || item?.criteriaId || 'Criteria';
        rawTitle = String(rawTitle || '');
        let displayName = rawTitle;
        if (rawTitle.includes(' - ')) {
          displayName = rawTitle.split(' - ').slice(-1).join(' - ').trim();
        }

        return {
          id: index + 1,
          name: displayName,
          score: Number.isFinite(rawNum) ? rawNum : undefined,
          percentage: this.normalizeScoreToPercent(rawNum)
        };
      });
    },
    collectSuggestionTexts(value, lang = this.selectedLanguage || 'en') {
      const result = [];

      const pushText = (input) => {
        if (input == null) return;
        if (typeof input === 'string' || typeof input === 'number' || typeof input === 'boolean') {
          const text = String(input).trim();
          if (text) result.push(text);
          return;
        }
        if (Array.isArray(input)) {
          input.forEach(pushText);
          return;
        }
        if (typeof input !== 'object') return;

        if (Array.isArray(input.items)) {
          input.items.forEach(item => {
            if (item && typeof item === 'object' && item.content !== undefined) pushText(item.content);
            else pushText(item);
          });
          return;
        }

        if (input.content !== undefined) {
          pushText(input.content);
          return;
        }

        if (input.title && !input.items) {
          pushText(input.title);
          return;
        }

        if (input.answer && input.answer.value) {
          pushText(input.answer.value);
          return;
        }

        if (input.value !== undefined) {
          pushText(input.value);
          return;
        }

        const localized = input[lang] || input.en || input.th || input.text || '';
        if (localized) result.push(String(localized).trim());
      };

      pushText(value);
      return result.filter(Boolean);
    },
    mapSuggestionList(list, lang = this.selectedLanguage || 'en') {
      const items = Array.isArray(list) ? list : (list ? [list] : []);
      if (items.length === 0) return [];

      const outstanding = [];
      const opportunity = [];

      // Helper to recursively find and extract points from an object
      const extractFromObject = (obj) => {
        if (!obj || typeof obj !== 'object' || Array.isArray(obj)) return false;

        // Check current level for common keys (including typos)
        const outData = obj.outstanding || obj.Outstanding || obj.outstandings;
        const oppData = obj.opportunity || obj.Opportunity || obj.opportunities || obj.oppotunity || obj.Oppotunity;

        let found = false;
        if (outData) {
          outstanding.push(...this.collectSuggestionTexts(outData, lang));
          found = true;
        }
        if (oppData) {
          opportunity.push(...this.collectSuggestionTexts(oppData, lang));
          found = true;
        }

        if (found) return true;

        // Recursively check nested objects if not found at this level
        for (const key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key)) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
              if (extractFromObject(obj[key])) return true;
            }
          }
        }
        return false;
      };

      items.forEach(item => {
        const val = item?.answer?.value || item?.value;
        if (!val) return;

        try {
          let parsed = null;
          if (typeof val === 'string') {
            const trimmed = val.trim();
            if (trimmed.startsWith('{')) {
              try {
                parsed = JSON.parse(trimmed);
              } catch (e) {
                // Handle potential trailing garbage (like extra braces)
                const lastIdx = trimmed.lastIndexOf('}');
                if (lastIdx !== -1) {
                  try {
                    parsed = JSON.parse(trimmed.substring(0, lastIdx + 1));
                  } catch (e2) {
                    // Try one more time by escaping newlines
                    try {
                      parsed = JSON.parse(trimmed.replace(/\n/g, '\\n').replace(/\r/g, '\\r'));
                    } catch (e3) { /* Give up */ }
                  }
                }
              }
            }
          } else if (typeof val === 'object' && !Array.isArray(val)) {
            parsed = val;
          }

          if (parsed && extractFromObject(parsed)) return;
        } catch (e) { }

        // Fallback: treat the whole value as an outstanding performance point
        outstanding.push(...this.collectSuggestionTexts(val));
      });

      if (outstanding.length === 0 && opportunity.length === 0) return [];

      return [{
        id: 1,
        name: this.studentData.name || 'Student',
        role: 'Evaluator',
        picture: this.studentData.picture,
        date: '',
        outstanding,
        opportunity
      }];
    },

    // New: parse suggestions into two lists (outstanding & opportunities)
    parseSuggestionLists(list, lang = this.selectedLanguage || 'en') {
      const outstandingPoints = [];
      const opportunityPoints = [];
      if (!Array.isArray(list)) return { outstandingGroups: [], opportunityGroups: [] };

      list.forEach(item => {
        const val = item?.answer?.value || item?.value;
        if (!val) return;

        if (typeof val === 'object') {
          outstandingPoints.push(...this.collectSuggestionTexts(val.outstanding || val.Outstanding || val.outstandings, lang));
          opportunityPoints.push(...this.collectSuggestionTexts(val.opportunity || val.Opportunity || val.opportunities || val.oppotunity || val.Oppotunity || val.suggestion || val.suggestions, lang));
        } else if (typeof val === 'string') {
          // fallback: treat plain string as an opportunity (growth suggestion)
          opportunityPoints.push(val);
        }
      });

      const base = {
        id: 1,
        name: this.studentData.name || 'Student',
        role: 'Student',
        picture: this.studentData.picture,
        date: ''
      };

      const outstandingGroups = outstandingPoints.length ? [{ ...base, points: outstandingPoints }] : [];
      const opportunityGroups = opportunityPoints.length ? [{ ...base, points: opportunityPoints }] : [];

      return { outstandingGroups, opportunityGroups };
    },
    updateChartsFromCompetencies() {
      const isThai = this.selectedLanguage === 'th';
      const specificLabelLimit = isThai ? 16 : 14;
      const generalLabelLimit = isThai ? 16 : 14;
      const specificLabels = this.specificCompetencies.map(s => this.formatChartLabel(s.name, specificLabelLimit));
      const specificData = this.specificCompetencies.map(s => s.percentage);
      const generalLabels = this.generalCompetencies.map(s => this.formatChartLabel(s.name, generalLabelLimit));
      const generalData = this.generalCompetencies.map(s => s.percentage);

      if (this.chartOptions && this.chartOptions.scale && this.chartOptions.scale.pointLabels) {
        this.chartOptions.scale.pointLabels.fontSize = isThai ? 9 : 11;
      }
      if (this.chartOptions && this.chartOptions.legend && this.chartOptions.legend.labels) {
        this.chartOptions.legend.labels.fontSize = isThai ? 11 : 12;
      }
      if (this.chartOptions && this.chartOptions.scale && this.chartOptions.scale.ticks) {
        this.chartOptions.scale.ticks.fontSize = isThai ? 10 : 12;
      }

      this.specificChartLabels = specificLabels;
      this.generalChartLabels = generalLabels;
      // Use consistent purple/pink styling matching exported PDF
      const hardAvg = this.hardAverages.length > 0 ? this.hardAverages : new Array(specificData.length).fill(65);
      const softAvg = this.softAverages.length > 0 ? this.softAverages : new Array(generalData.length).fill(70);

      this.specificChartDatasets = [
        {
          label: 'You',
          data: specificData,
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124,58,237,0.35)',
          pointBackgroundColor: '#7c3aed',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#7c3aed',
          borderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Average',
          data: hardAvg,
          borderColor: '#fb7185',
          backgroundColor: 'rgba(251,113,133,0.3)',
          pointBackgroundColor: '#fb7185',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#fb7185',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 4
        }
      ];
      this.generalChartDatasets = [
        {
          label: 'You',
          data: generalData,
          borderColor: '#7c3aed',
          backgroundColor: 'rgba(124,58,237,0.35)',
          pointBackgroundColor: '#7c3aed',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#7c3aed',
          borderWidth: 3,
          pointRadius: 3,
          pointHoverRadius: 5
        },
        {
          label: 'Average',
          data: softAvg,
          borderColor: '#fb7185',
          backgroundColor: 'rgba(251,113,133,0.3)',
          pointBackgroundColor: '#fb7185',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#fb7185',
          borderDash: [5, 5],
          borderWidth: 2,
          pointRadius: 3,
          pointHoverRadius: 4
        }
      ];
    },
    formatChartLabel(label, maxLen = 14) {
      return formatChartLabel(label, maxLen, this.selectedLanguage);
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

        if (!evalData) {
          this.generalCompetencies = [];
          this.specificCompetencies = [];
          this.Outstanding = [];
          this.Opportunities = [];
          this.updateChartsFromCompetencies();
          return;
        }

        const softskills = Array.isArray(evalData) ? evalData[0]?.softskills : evalData.softskills;
        const hardskills = Array.isArray(evalData) ? evalData[0]?.hardskills : evalData.hardskills;
        const suggestions = Array.isArray(evalData)
          ? (evalData[0]?.suggestions || evalData[0]?.sugestion)
          : (evalData.suggestions || evalData.sugestion);

        const general = this.mapEvaluationList(softskills);
        const specific = this.mapEvaluationList(hardskills);

        if (general.length) this.generalCompetencies = general;
        if (specific.length) this.specificCompetencies = specific;

        const suggestionList = this.mapSuggestionList(suggestions);
        if (suggestionList.length > 0) {
          const feedback = suggestionList[0];
          // Assign to separate categories based on parsed content
          // Ensure we use the exact array of points for rendering
          this.Outstanding = feedback.outstanding && feedback.outstanding.length > 0
            ? [{ ...feedback, points: feedback.outstanding }]
            : [];
          this.Opportunities = feedback.opportunity && feedback.opportunity.length > 0
            ? [{ ...feedback, points: feedback.opportunity }]
            : [];
        } else {
          this.Outstanding = [];
          this.Opportunities = [];
        }
        await this.fetchAverages(student._id);
        this.updateChartsFromCompetencies();
      } catch (err) {
        console.error('Failed to load evaluation data', err);
      }
    },
    async fetchAverages(studentId) {
      try {
        const res = await this.$store.dispatch('competencies/evaluation/averages', { studentId });
        this.softAverages = (res?.soft || []).map(s => this.normalizeScoreToPercent(s));
        this.hardAverages = (res?.hard || []).map(s => this.normalizeScoreToPercent(s));
      } catch (err) {
        console.warn('Failed to fetch averages:', err);
        this.softAverages = [];
        this.hardAverages = [];
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
        const currentUserId = user?._id || user?.id || this.targetStudentId;
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
            const lang = this.selectedLanguage || 'en';
            const nameLoc = Array.isArray(student.name)
              ? (student.name.find(n => n?.key === lang)?.value || student.name.find(n => n?.value)?.value)
              : '';
            const schoolLoc = Array.isArray(student.info?.school?.title)
              ? (student.info.school.title.find(t => t?.key === lang)?.value || student.info.school.title.find(t => t?.value)?.value)
              : '';
            const programLoc = Array.isArray(student.info?.program?.title)
              ? (student.info.program.title.find(t => t?.key === lang)?.value || student.info.program.title.find(t => t?.value)?.value)
              : '';

            this.studentData = {
              ...this.studentData,
              name: nameLoc || this.studentData.name,
              studentID: student.studentID || this.studentData.studentID,
              school: schoolLoc || this.studentData.school,
              program: programLoc || this.studentData.program
            };

            if (this.$store?.commit) {
              this.$store.commit('auth/setUser', {
                ...user,
                name: nameLoc || user.name,
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
    async buildDocumentData(exportLanguage = this.selectedLanguage || 'en') {
      const toPdfItems = (items) => {
        if (!Array.isArray(items)) return [];
        return items.map(item => {
          const hasRaw = (item && item.score !== undefined && item.score !== null);
          const rawScore = hasRaw ? Number(item.score) : undefined;
          const percent = (item && item.percentage !== undefined && item.percentage !== null)
            ? Number(item.percentage)
            : this.normalizeScoreToPercent(rawScore);
          return {
            name: item?.name || 'N/A',
            // `score` kept as raw numeric when available; otherwise left undefined so table falls back to percentage
            score: rawScore,
            // percentage always provided for graphs
            percentage: percent
          };
        });
      };

      // Try to replace specific competency names with labels from hardskill config
      const specificRaw = toPdfItems(this.specificCompetencies);
      let specificMapped = specificRaw;

      try {
        // find current student object to determine program/year if available
        const authUser = this.$store?.state?.auth?.user;
        const email = authUser?.email || (() => {
          try { const userStr = localStorage.getItem('auth_user'); return userStr ? JSON.parse(userStr)?.email : ''; } catch (e) { return ''; }
        })();
        const student = this.findStudent(this.targetStudentId || authUser?._id, email);

        // fetch hardskill configs
        const res = await this.$api.specific('get');
        const hards = (res && res.data && res.data.data) ? res.data.data : [];

        // helper to read localized value
        const getVal = (arr, k = exportLanguage) => {
          if (!Array.isArray(arr)) return '';
          const found = arr.find(i => i.key === k);
          return found ? found.value : (arr[0] ? arr[0].value : '');
        };

        // Choose candidate configs: prefer same program and year, then active ones, fallback to any
        const programId = student?.info?.program?._id || student?.info?.program || null;
        const getYrVal = yr => {
          if (Array.isArray(yr)) {
            const found = yr.find(y => y.key === 'en') || yr[0];
            return found ? found.value : null;
          }
          if (yr && typeof yr === 'object') return yr.value || null;
          return yr || null;
        };
        const studentYear = getYrVal(student?.info?.year);

        let candidates = hards;
        if (programId) candidates = candidates.filter(h => h.program && ((h.program._id && String(h.program._id) === String(programId)) || String(h.program) === String(programId)));
        if (studentYear) {
          const filteredByYear = candidates.filter(h => h.year === studentYear);
          if (filteredByYear.length) candidates = filteredByYear;
        }
        if (!candidates.length) candidates = hards;

        // Prefer active doc
        let activeDoc = candidates.find(h => h.active) || candidates[0];

        if (activeDoc && Array.isArray(activeDoc.config)) {
          // Build a map from question text and labels -> target label for quick lookup
          const qToLabel = new Map();
          activeDoc.config.forEach(conf => {
            const qTh = getVal(conf.question, 'th');
            const qEn = getVal(conf.question, 'en');
            const labelTh = getVal(conf.label, 'th');
            const labelEn = getVal(conf.label, 'en');
            // Fetch the label in the target language (fallback to English if not found)
            const labelTarget = getVal(conf.label, exportLanguage) || getVal(conf.label, 'en');
            if (qTh) qToLabel.set(String(qTh).trim().toLowerCase(), labelTarget);
            if (qEn) qToLabel.set(String(qEn).trim().toLowerCase(), labelTarget);
            // Crucial: also map the exact labels to the target label!
            if (labelTh) qToLabel.set(String(labelTh).trim().toLowerCase(), labelTarget);
            if (labelEn) qToLabel.set(String(labelEn).trim().toLowerCase(), labelTarget);
          });

          // Map specificRaw names to labels when possible
          specificMapped = specificRaw.map(it => {
            try {
              const nameStr = String(it.name || '').trim();
              const fullKey = nameStr.toLowerCase();
              // If title was saved as "Category - Question", extract question part
              const questionPart = nameStr.includes(' - ') ? nameStr.split(' - ').slice(-1).join(' - ').trim().toLowerCase() : '';

              // Prefer exact full-key match, then question-part match, then substring heuristic
              if (fullKey && qToLabel.has(fullKey)) {
                return { ...it, name: qToLabel.get(fullKey) || it.name };
              }
              if (questionPart && qToLabel.has(questionPart)) {
                return { ...it, name: qToLabel.get(questionPart) || it.name };
              }

              // fallback: try to find any key where either contains the other
              for (const [qKey, lbl] of qToLabel.entries()) {
                if (!qKey) continue;
                if (fullKey.includes(qKey) || qKey.includes(fullKey) || (questionPart && (questionPart.includes(qKey) || qKey.includes(questionPart)))) {
                  return { ...it, name: lbl || it.name };
                }
              }
            } catch (e) { }
            return it;
          });
        }
      } catch (err) {
        // silent fallback to raw items on any error
        console.warn('Failed to map specific competencies to config labels', err);
        specificMapped = specificRaw;
      }

      // Disabled capturing rendered chart canvases (so generator falls back to native drawing for translated text)
      const chartImages = {};

      // Locate raw evaluation suggestions for this student (so generator can use answer.value)
      let rawSuggestions = [];
      try {
        const authUser = this.$store?.state?.auth?.user;
        const email = authUser?.email || (() => {
          try { const userStr = localStorage.getItem('auth_user'); return userStr ? JSON.parse(userStr)?.email : ''; } catch (e) { return ''; }
        })();
        const student = this.findStudent(this.targetStudentId || authUser?._id, email);
        const evalPayload = this.storedEvaluations || [];
        const evalDataRecord = Array.isArray(evalPayload)
          ? evalPayload.find(e => {
            const sId = e?.studentId?._id || e?.studentId;
            return String(sId) === String(student?._id);
          })
          : evalPayload;
        rawSuggestions = evalDataRecord
          ? (Array.isArray(evalDataRecord)
            ? (evalDataRecord?.sugestion || evalDataRecord?.suggestions || [])
            : (evalDataRecord.sugestion || evalDataRecord.suggestions || []))
          : [];
      } catch (e) { rawSuggestions = []; }

      // Fetch translated Student Name, School, and Program if available
      let studentForLang = null;
      try {
        const authUser = this.$store?.state?.auth?.user;
        const email = authUser?.email || (() => { try { const userStr = localStorage.getItem('auth_user'); return userStr ? JSON.parse(userStr)?.email : ''; } catch (e) { return ''; } })();
        studentForLang = this.findStudent(this.targetStudentId || authUser?._id, email);
      } catch (e) { }

      let studentNameString = this.studentData.name;
      let schoolLang = this.studentData.school;
      let programLang = this.studentData.program;

      if (studentForLang) {
        const sLang = exportLanguage || 'en';
        if (Array.isArray(studentForLang.name)) {
          const found = studentForLang.name.find(n => n?.key === sLang);
          if (found && found.value) studentNameString = found.value;
        } else if (typeof studentForLang.name === 'object' && studentForLang.name !== null) {
          if (studentForLang.name[sLang]) studentNameString = studentForLang.name[sLang];
        }

        if (studentForLang.info) {
          if (Array.isArray(studentForLang.info.school?.title)) {
            const found = studentForLang.info.school.title.find(t => t?.key === sLang);
            if (found && found.value) schoolLang = found.value;
          }
          if (Array.isArray(studentForLang.info.program?.title)) {
            const found = studentForLang.info.program.title.find(t => t?.key === sLang);
            if (found && found.value) programLang = found.value;
          }
        }
      }

      if (typeof studentNameString !== 'string') {
        studentNameString = String(studentNameString || '');
      }

      // Prepare flattened fallback arrays from raw suggestion value objects
      const outstandingFlatten = (Array.isArray(rawSuggestions) ? rawSuggestions.reduce((acc, it) => {
        try {
          const val = (it && it.answer && it.answer.value) ? it.answer.value : (it && it.value ? it.value : null);
          if (val) {
            const list = [].concat(val.outstanding || val.outcome || val.Opportunity || val.opportunity || []);
            list.forEach(p => {
              if (p) {
                let obj = p;
                if (typeof p === 'string' && p.trim().startsWith('{')) {
                  try { obj = JSON.parse(p); } catch (e) { }
                }
                if (typeof obj === 'object' && obj !== null && (obj.th || obj.en)) {
                  acc.push(obj[exportLanguage || 'en'] || obj.en || obj.th || '');
                } else {
                  acc.push(p);
                }
              }
            });
          }
        } catch (e) { }
        return acc;
      }, []) : []);

      const opportunityFlatten = (Array.isArray(rawSuggestions) ? rawSuggestions.reduce((acc, it) => {
        try {
          const val = (it && it.answer && it.answer.value) ? it.answer.value : (it && it.value ? it.value : null);
          if (val) {
            const list = [].concat(val.opportunity || val.opportunities || val.suggestion || val.suggestions || []);
            list.forEach(p => {
              if (p) {
                let obj = p;
                if (typeof p === 'string' && p.trim().startsWith('{')) {
                  try { obj = JSON.parse(p); } catch (e) { }
                }
                if (typeof obj === 'object' && obj !== null && (obj.th || obj.en)) {
                  acc.push(obj[exportLanguage || 'en'] || obj.en || obj.th || '');
                } else {
                  acc.push(p);
                }
              }
            });
          }
        } catch (e) { }
        return acc;
      }, []) : []);

      // Always rebuild suggestion data from the raw payload for export language.
      const suggestionGroups = this.parseSuggestionLists(rawSuggestions, exportLanguage);
      const missingResultMessage = String(exportLanguage || 'en').toLowerCase().startsWith('th')
        ? 'ยังไม่ได้รับผลลัพธ์การฝึกงาน'
        : 'Internship results are not available yet.';
      const ensureSuggestionFallback = (groups) => (Array.isArray(groups) && groups.length > 0 ? groups : [missingResultMessage]);
      const outForPdf = ensureSuggestionFallback(suggestionGroups.outstandingGroups);
      const oppForPdf = ensureSuggestionFallback(suggestionGroups.opportunityGroups);

      // Re-map evaluation data into the selected language for the PDF without updating the UI state
      let generalMapped = this.generalCompetencies;
      try {
        const evalPayload = this.storedEvaluations || [];
        const evalData = Array.isArray(evalPayload)
          ? evalPayload.find(e => String(e?.studentId?._id || e?.studentId) === String(studentForLang?._id))
          : evalPayload;
        if (evalData && evalData.softskills) {
          generalMapped = this.mapEvaluationList(evalData.softskills, exportLanguage);
        } else {
          generalMapped = [];
        }
      } catch (e) {
        console.warn('Failed to remap general competencies for PDF', e);
        generalMapped = [];
      }

      const specificMappedLocalized = (() => {
        try {
        const evalPayload = this.storedEvaluations || [];
        const evalData = Array.isArray(evalPayload)
          ? evalPayload.find(e => String(e?.studentId?._id || e?.studentId) === String(studentForLang?._id))
          : evalPayload;
        if (evalData && evalData.hardskills) {
          return this.mapEvaluationList(evalData.hardskills, exportLanguage);
        }
      } catch (e) { }
        return [];
      })();

      return {
        StudentName: studentNameString,
        StudentID: this.studentData.studentID,
        School: schoolLang,
        Program: programLang,
        AcademyYear: String(new Date().getFullYear()),
        CompanyLogo: '',
        StudentPhoto: this.studentData.picture,
        GeneralCompetencies: toPdfItems(generalMapped).map((item, idx) => ({
          ...item,
          average: Number.isFinite(this.softAverages?.[idx]) ? this.softAverages[idx] : undefined
        })),
        SpecificCompetencies: specificMappedLocalized.map((item, idx) => ({
          ...item,
          average: Number.isFinite(this.hardAverages?.[idx]) ? this.hardAverages[idx] : undefined
        })),
        Outstanding: outForPdf,
        Opportunities: oppForPdf,
        // include raw suggestion objects so generator can pull answer.value.outstanding/opportunity if needed
        Suggestion: rawSuggestions,
        suggestion: rawSuggestions,
        __chartImages: chartImages,
        __language: exportLanguage
      };
    },
    async handleDownload() {
      const doc = this.publicDocuments.find(d => d._id === this.selectedDocumentId);
      if (!doc) return;

      try {
        if (doc.content && doc.content.elements) {
          const dataMap = await this.buildDocumentData(doc.content.locale || doc.locale || this.selectedLanguage || 'en');
          // Debug: show data passed into PDF generator
          console.log('download PDF dataMap', {
            StudentName: dataMap.StudentName,
            Outstanding: dataMap.Outstanding,
            Opportunities: dataMap.Opportunities
          });
          await downloadClientPDF(
            doc.content,
            dataMap,
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
  watch: {
    selectedLanguage() {
      // Re-map evaluation lists and charts when the app locale changes.
      this.loadStudentData();
      this.loadEvaluationData();
    }
  },
  computed: {
    ...mapGetters('member/students', { storedStudents: 'students' }),
    ...mapGetters('competencies/evaluation', { storedEvaluations: 'evaluations' }),
    selectedLanguage: {
      get() {
        return this.$store.getters['setting/lang'] || 'en';
      },
      set(val) {
        this.$store.commit('setting/lang', val);
      }
    },
    avatarSrc() {
      try {
        const pic = this.studentData && this.studentData.picture;
        if (!pic) return this.defaultAvatar;
        if (typeof pic === 'string') return pic;
        // handle common object shapes { url, src, path }
        if (typeof pic === 'object') {
          return pic.url || pic.src || pic.path || this.defaultAvatar;
        }
        return this.defaultAvatar;
      } catch (e) {
        return this.defaultAvatar;
      }
    },
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
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.05) !important;
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

.bg-light-success {
  background-color: #e6fffa;
}

.bg-light-info {
  background-color: #e6f6ff;
}

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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03);
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

.download-modal-dialog ::v-deep .modal-dialog {
  max-width: 720px;
  width: calc(100vw - 2rem);
}

.download-modal-body {
  max-height: calc(100vh - 240px);
  overflow-y: auto;
}

.download-modal-body::-webkit-scrollbar {
  width: 8px;
}

.download-modal-body::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 999px;
}

.download-modal-body::-webkit-scrollbar-track {
  background: transparent;
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
  filter: drop-shadow(0 0 5px rgba(0, 0, 0, 0.02));
}

/* Percentage number styling */
.percent-number {
  color: #000;
}
</style>
