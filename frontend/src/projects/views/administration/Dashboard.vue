<template>
  <div>
    <!-- Page Header -->
    <CCard class="border-0 shadow-sm custom-card mb-4 overflow-hidden header-card-accent">
      <CCardBody class="p-4 d-flex justify-content-between align-items-center bg-white">
        <div class="flex-grow-1">
          <h2 class="font-weight-bold text-dark mb-1">Dashboard</h2>
          <div class="d-flex align-items-center">
            <span class="text-muted small font-weight-bold">
              {{ $i18n.locale === 'th' ? 'สรุปภาพรวมผลการประเมินและสถิติการฝึกงานของนักศึกษา' : 'Overview of student internship evaluation and statistics' }}
            </span>
          </div>
        </div>
        <div class="ml-auto">
          <CButton color="primary" class="px-4 modern-header-btn" @click="showDownloadModal = true">
            <CIcon name="cil-cloud-download" class="mr-2"/>
            {{ $i18n.locale === 'th' ? 'ดาวน์โหลดรายงานแบบประเมิน' : 'Download Evaluation Report' }}
          </CButton>
        </div>

    <!-- Download Language Selection Modal -->
    <CModal
      :show.sync="showDownloadModal"
      :centered="true"
      class="modern-modal"
    >
      <template #header>
        <h5 class="modal-title font-weight-bold">ดาวน์โหลดรายงาน / Download Report</h5>
        <CButtonClose @click="showDownloadModal = false" />
      </template>
      <div class="p-3">
        <p class="text-muted small mb-4 text-center">กรุณาเลือกรูปแบบไฟล์ที่คุณต้องการดาวน์โหลด (Select your preferred format)</p>
        
        <CButton 
          block 
          color="primary" 
          variant="outline" 
          class="mb-3 py-3 modern-modal-btn d-flex align-items-center justify-content-between"
          @click="handleDownload('th')"
        >
          <div><CIcon name="cil-file" class="mr-3 text-info"/>เอกสารรายงาน (ภาษาไทย)</div>
          <CIcon name="cil-chevron-right" size="sm"/>
        </CButton>

        <CButton 
          block 
          color="primary" 
          variant="outline" 
          class="mb-3 py-3 modern-modal-btn d-flex align-items-center justify-content-between"
          @click="handleDownload('en')"
        >
          <div><CIcon name="cil-file" class="mr-3 text-primary"/>Evaluation Report (English)</div>
          <CIcon name="cil-chevron-right" size="sm"/>
        </CButton>

        <CButton 
          block 
          color="dark" 
          variant="outline" 
          class="mb-2 py-3 modern-modal-btn d-flex align-items-center justify-content-between"
          @click="handleDownload('json')"
        >
          <div><CIcon name="cil-code" class="mr-3 text-secondary"/>ข้อมูลดิบ (JSON Data)</div>
          <CIcon name="cil-chevron-right" size="sm"/>
        </CButton>
      </div>
      <template #footer>
        <CButton color="secondary" @click="showDownloadModal = false">ยกเลิก</CButton>
      </template>
    </CModal>
      </CCardBody>
    </CCard>

    <WidgetsDropdown 
      :schoolName="selectedSchoolName" 
      :total="totalStudentsCount"
      :evaluated="evaluatedCount"
      :notEvaluated="notEvaluatedCount"
      @filter-status="handleStatusFilter" 
    />

    <!-- Filter Card -->
    <CCard class="border-0 shadow-sm custom-card mb-4 overflow-hidden">
      <CCardBody class="p-4">
        <CRow>
          <CCol md="4" class="mb-3 mb-md-0">
            <div class="filter-group">
              <label class="filter-label">School / Faculty</label>
              <CSelect 
                :value.sync="selectedSchool" 
                :options="schoolOptions"
                class="modern-select"
              />
            </div>
          </CCol>
          <CCol md="4" class="mb-3 mb-md-0">
            <div class="filter-group">
              <label class="filter-label">Program / Major</label>
              <CSelect 
                :value.sync="selectedProgram" 
                :options="programOptions"
                class="modern-select"
              />
            </div>
          </CCol>
          <CCol md="4">
            <div class="filter-group">
              <label class="filter-label">Academic Year</label>
              <CSelect 
                :value.sync="selectedYear" 
                :options="yearOptions"
                class="modern-select"
              />
            </div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>


    <CRow class="mt-2">
      <CCol md="8">
        <div class="bg-white p-4 custom-card shadow-sm">
          <h5 class="font-weight-bold text-dark mb-4">{{ chartTitle }}</h5>
          <div style="height: 650px;">
            <CChartBar 
              :labels="barChartData.labels" 
              :datasets="barChartData.datasets"
              :options="barChartOptions"
            />
          </div>
        </div>
      </CCol>
      <CCol md="4">
        <div class="bg-white p-4 custom-card shadow-sm">
          <h5 class="font-weight-bold text-dark mb-4">{{ $t('dashboard.evaluationStatus') }}</h5>
          <div style="height: 480px;">
            <CChartDoughnut 
              :labels="doughnutData.labels"
              :datasets="doughnutData.datasets"
            />
          </div>

          <!-- Info Cards Below Doughnut -->
          <div class="mt-3">
            <div class="d-flex justify-content-between mb-2 p-3 custom-card" style="background: rgba(34, 197, 94, 0.05); border: 1px solid rgba(34, 197, 94, 0.1);">
              <div class="d-flex align-items-center">
                <div class="mr-2" style="width: 12px; height: 12px; border-radius: 50%; background: #22c55e;"></div>
                <span class="font-weight-bold text-dark" style="font-size: 0.9rem;">{{ $t('dashboard.evaluated') }}</span>
              </div>
              <span class="font-weight-bold" style="color: #16a34a; font-size: 1.1rem;">{{ doughnutEvaluatedCount.toLocaleString() }}</span>
            </div>

            <div class="d-flex justify-content-between p-3 custom-card" style="background: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1);">
              <div class="d-flex align-items-center">
                <div class="mr-2" style="width: 12px; height: 12px; border-radius: 50%; background: #ef4444;"></div>
                <span class="font-weight-bold text-dark" style="font-size: 0.9rem;">{{ $t('dashboard.notEvaluated') }}</span>
              </div>
              <span class="font-weight-bold" style="color: #dc2626; font-size: 1.1rem;">{{ doughnutNotEvaluatedCount.toLocaleString() }}</span>
            </div>
          </div>
        </div>
      </CCol>
    </CRow>
    <CRow class="mt-4">
      <CCol md="12">
        <div class="bg-white p-4 custom-card shadow-sm">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h5 class="font-weight-bold text-dark mb-0">{{ $t('dashboard.studentList') }}</h5>
            <CButtonGroup class="modern-timeline-group">
              <CButton 
                color="primary" 
                variant="outline" 
                size="sm"
                class="modern-timeline-btn"
                :active="selectedTimeline === 'all'"
                @click="selectedTimeline = 'all'"
              >
                {{ $i18n.locale === 'th' ? 'ทั้งหมด' : 'All' }}
              </CButton>
              <CButton 
                color="primary" 
                variant="outline" 
                size="sm"
                class="modern-timeline-btn"
                :active="selectedTimeline === 'today'"
                @click="selectedTimeline = 'today'"
              >
                {{ $i18n.locale === 'th' ? 'วันนี้' : 'Today' }}
              </CButton>
              <CButton 
                color="primary" 
                variant="outline" 
                size="sm"
                class="modern-timeline-btn"
                :active="selectedTimeline === '7days'"
                @click="selectedTimeline = '7days'"
              >
                {{ $i18n.locale === 'th' ? '7 วันที่ผ่านมา' : '7 Days' }}
              </CButton>
              <CButton 
                color="primary" 
                variant="outline" 
                size="sm"
                class="modern-timeline-btn"
                :active="selectedTimeline === '30days'"
                @click="selectedTimeline = '30days'"
              >
                {{ $i18n.locale === 'th' ? '30 วันที่ผ่านมา' : '30 Days' }}
              </CButton>
            </CButtonGroup>
          </div>
          <CDataTable
            :items="tableData"
            :fields="tableFields"
            :items-per-page="7"
            hover
            pagination
            class="mb-0"
          >
            <template #status="{item}">
              <td>
                <CBadge :color="item.evaluation ? 'success' : 'danger'" class="p-2" style="border-radius: 8px; min-width: 100px;">
                  {{ item.evaluation ? $t('dashboard.evaluated') : $t('dashboard.notEvaluated') }}
                </CBadge>
              </td>
            </template>
          </CDataTable>
        </div>
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'


import WidgetsDropdown from '../../components/widgets/WidgetsDashboard.vue'
import CChartBar from '../../components/charts/CChartBar.vue'
import CChartDoughnut from '../../components/charts/CChartDoughnut.vue'
import * as XLSX from "xlsx"

export default {
  name: 'Dashboard',
  components: {

    WidgetsDropdown,
    CChartBar,
    CChartDoughnut
  },
  data() {
    return {
      selectedSchool: '',
      selectedProgram: '',
      selectedYear: '',
      selectedEvaluated: '',
      selectedTimeline: 'all',
      showDownloadModal: false,
    }
  },
  computed: {
    ...mapGetters('academic/schools', { storedSchools: 'schools' }),
    ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
    ...mapGetters('member/students', { storedStudents: 'students' }),
    ...mapGetters('member/advisors', { storedAdvisors: 'advisors' }),
    ...mapGetters('competencies/general', { storedGeneral: 'general' }),
    ...mapGetters('competencies/specific', { storedSpecific: 'specific' }),

    filteredStudents() {
      if (!this.storedStudents) return [];
      return this.storedStudents.filter(student => {
        const info = student.info || {};
        
        // School Filter
        if (this.selectedSchool && (info.school?._id || info.school) !== this.selectedSchool) return false;
        
        // Program Filter
        if (this.selectedProgram && (info.program?._id || info.program) !== this.selectedProgram) return false;
        
        // Year Filter
        if (this.selectedYear && String(info.year) !== String(this.selectedYear)) return false;
        
        // Evaluated Filter (Logic: student.evaluation exists)
        if (this.selectedEvaluated === 'evaluated') {
          if (!student.evaluation) return false;
        } else if (this.selectedEvaluated === 'not_evaluated') {
          if (student.evaluation) return false;
        }

        // Timeline Filter
        if (this.selectedTimeline && this.selectedTimeline !== 'all') {
          const now = new Date();
          const studentDate = new Date(student.updatedAt);
          const diffInTime = now.getTime() - studentDate.getTime();
          const diffInDays = diffInTime / (1000 * 3600 * 24);

          if (this.selectedTimeline === 'today' && diffInDays > 1) return false;
          if (this.selectedTimeline === '7days' && diffInDays > 7) return false;
          if (this.selectedTimeline === '30days' && diffInDays > 30) return false;
        }
        
        return true;
      });
    },

    totalStudentsCount() {
      return this.filteredStudents.length;
    },

    evaluatedCount() {
      return this.filteredStudents.filter(s => s.evaluation).length;
    },

    notEvaluatedCount() {
      return this.filteredStudents.filter(s => !s.evaluation).length;
    },

    selectedSchoolName() {
      const found = this.schoolOptions.find(s => s.value === this.selectedSchool);
      return found ? found.label : this.$t('dashboard.allSchools');
    },
    chartTitle() {
      const isThai = this.$i18n.locale === 'th';
      if (this.selectedSchool) {
        const schoolObj = (this.storedSchools || []).find(s => s._id === this.selectedSchool);
        const lang = this.$i18n.locale || 'en';
        const schoolName = schoolObj ? (schoolObj.title.find(t => t.key === lang)?.value || schoolObj.title.find(t => t.key === 'en')?.value) : '';
        const prefix = isThai ? 'สถิติการประเมินนักศึกษาของ' : 'Student Evaluation Statistics for';
        return schoolName ? `${prefix} ${schoolName}` : this.$t('dashboard.chartTitle');
      }
      return isThai ? 'สถิติการประเมินนักศึกษาแยกตามคณะ' : 'Student Evaluation Statistics by School';
    },

    schoolOptions() {
      if (!this.storedSchools) return [{ value: '', label: this.$t('dashboard.allSchools') }];
      return [
        { value: '', label: this.$t('dashboard.allSchools') },
        ...this.storedSchools.map(s => ({
          value: s._id,
          label: s.title.find(t => t.key === this.$i18n.locale)?.value || s.title.find(t => t.key === 'en')?.value || s.title.find(t => t.key === 'th')?.value || s._id
        }))
      ];
    },





    programOptions() {
      const lang = this.$i18n.locale || 'en';
      let source = this.storedPrograms || [];

      if (this.selectedSchool) {
        source = source.filter(program => program.school === this.selectedSchool);
      }

      return [
        { value: '', label: this.$t('dashboard.allPrograms') },
        ...source.map(item => {
          const titleObj = item.title.find(t => t.key === lang) || item.title.find(t => t.key === 'en');
          return {
            value: item._id,
            label: titleObj ? titleObj.value : item._id
          };
        })
      ];
    },
    yearOptions() {
      if (!this.storedStudents || !this.storedStudents.length) return [];
      const years = new Set(this.storedStudents.map(s => s.info?.year).filter(y => y));
      return Array.from(years).sort((a, b) => b - a).map(y => ({ value: y, label: String(y) }));
    },

    doughnutStudents() {
      return this.storedStudents.filter(student => {
        const info = student.info || {};
        if (this.selectedSchool && (info.school?._id || info.school) !== this.selectedSchool) return false;
        if (this.selectedProgram && (info.program?._id || info.program) !== this.selectedProgram) return false;
        if (this.selectedYear && String(info.year) !== String(this.selectedYear)) return false;
        return true;
      });
    },

    doughnutEvaluatedCount() {
      return this.doughnutStudents.filter(s => s.evaluation).length;
    },

    doughnutNotEvaluatedCount() {
      return this.doughnutStudents.length - this.doughnutEvaluatedCount;
    },

    doughnutData() {
      return {
        labels: [this.$t('dashboard.evaluated'), this.$t('dashboard.notEvaluated')],
        datasets: [
          {
            backgroundColor: ['rgba(34, 197, 94, 0.15)', 'rgba(239, 68, 68, 0.15)'],
            borderColor: ['#22c55e', '#ef4444'],
            borderWidth: 2,
            data: [this.doughnutEvaluatedCount, this.doughnutNotEvaluatedCount],
            hoverBackgroundColor: ['rgba(34, 197, 94, 0.25)', 'rgba(239, 68, 68, 0.25)']
          }
        ]
      };
    },

    tableData() {
      const lang = this.$i18n.locale || 'en';
      return this.filteredStudents.map(student => {
        const info = student.info || {};
        
        // Find School Title
        const schoolObj = (this.storedSchools || []).find(s => s._id === (info.school?._id || info.school));
        const schoolTitle = schoolObj ? (schoolObj.title.find(t => t.key === lang)?.value || schoolObj.title.find(t => t.key === 'en')?.value) : '-';
        
        // Find Program Title
        const programObj = (this.storedPrograms || []).find(p => p._id === (info.program?._id || info.program));
        const programTitle = programObj ? (programObj.title.find(t => t.key === lang)?.value || programObj.title.find(t => t.key === 'en')?.value) : '-';

        // Find Name
        const nameObj = student.name?.find(n => n.key === lang) || student.name?.find(n => n.key === 'th') || student.name?.[0] || {};
        const fullname = nameObj.value || `${student.firstname || ''} ${student.lastname || ''}`.trim() || '-';

        return {
          ...student,
          code: info.code || student.studentID || '-',
          fullname: fullname,
          schoolName: schoolTitle,
          programName: programTitle,
          status: student.evaluation ? 'Evaluated' : 'Not Evaluated'
        };
      });
    },

    tableFields() {
      return [
        { key: 'code', label: this.$t('dashboard.studentId'), _style: 'width:15%' },
        { key: 'fullname', label: this.$t('dashboard.fullname'), _style: 'width:25%' },
        { key: 'schoolName', label: this.$t('dashboard.school'), _style: 'width:20%' },
        { key: 'programName', label: this.$t('dashboard.program'), _style: 'width:20%' },
        { key: 'status', label: this.$t('dashboard.status'), _style: 'width:20%' },
      ];
    },

    barChartData() {
      const labels = [];
      const evaluatedData = [];
      const notEvaluatedData = [];
      const lang = this.$i18n.locale || 'en';
      
      let itemsToMap = [];
      if (this.selectedSchool) {
        // Mode: Show Programs within selected School
        itemsToMap = (this.storedPrograms || []).filter(p => p.school === this.selectedSchool);
      } else {
        // Mode: Show all Schools
        itemsToMap = this.storedSchools || [];
      }

      itemsToMap.forEach(item => {
        const label = item.title.find(t => t.key === lang)?.value || item.title.find(t => t.key === 'en')?.value || item._id;
        
        const itemStudents = this.storedStudents.filter(student => {
          const info = student.info || {};
          // Must match Year if selected
          if (this.selectedYear && String(info.year) !== String(this.selectedYear)) return false;
          // If viewing programs, match program id. If viewing schools, match school id.
          if (this.selectedSchool) {
            return (info.program?._id || info.program) === item._id;
          } else {
            return (info.school?._id || info.school) === item._id;
          }
        });

        labels.push(label);
        const evalCount = itemStudents.filter(s => s.evaluation).length;
        const notEvalCount = itemStudents.length - evalCount;
        evaluatedData.push(evalCount);
        notEvaluatedData.push(notEvalCount);
      });

      return {
        labels,
        datasets: [
          {
            label: this.$t('dashboard.evaluated'),
            backgroundColor: 'rgba(34, 197, 94, 0.15)',
            borderColor: '#22c55e',
            borderWidth: 2,
            hoverBackgroundColor: 'rgba(34, 197, 94, 0.25)',
            data: evaluatedData,
            barThickness: 32,
          },
          {
            label: this.$t('dashboard.notEvaluated'),
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            borderColor: '#ef4444',
            borderWidth: 2,
            hoverBackgroundColor: 'rgba(239, 68, 68, 0.25)',
            data: notEvaluatedData,
            barThickness: 32,
          }
        ]
      };
    },

    barChartOptions() {
      const self = this;
      return {
        maintainAspectRatio: false,
        legend: { 
          display: true, 
          position: 'top',
          align: 'end',
          labels: {
            usePointStyle: true,
            padding: 20,
            fontColor: '#4b5563',
            fontSize: 12,
            fontStyle: '600'
          }
        },
        animation: {
          duration: 1000,
          onComplete: function() {
            const chartInstance = this.chart;
            const ctx = chartInstance.ctx;
            ctx.font = 'bold 12px "Inter", sans-serif';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#1e293b';

            const datasets = this.data.datasets;
            // Use the meta of the last dataset to get the total horizontal position
            const meta = chartInstance.controller.getDatasetMeta(datasets.length - 1);

            meta.data.forEach(function(bar, index) {
              let total = 0;
              datasets.forEach(dataset => {
                total += dataset.data[index];
              });
              if (total > 0) {
                ctx.fillText(total.toLocaleString(), bar._model.x + 8, bar._model.y);
              }
            });
          }
        },
        scales: {
          xAxes: [{
            stacked: true,
            gridLines: { color: '#f1f5f9', drawBorder: false, zeroLineColor: '#f1f5f9' },
            ticks: {
              beginAtZero: true,
              fontColor: '#94a3b8',
              fontSize: 11,
              padding: 10,
              suggestedMax: Math.max(...(self.barChartData.datasets[0]?.data || [0])) * 1.5,
              callback: (value) => value % 1 === 0 ? value : null
            }
          }],
          yAxes: [{
            stacked: true,
            gridLines: { display: false, drawBorder: false },
            ticks: { 
              fontColor: '#1e293b', 
              fontSize: 12, 
              fontStyle: '600',
              padding: 10
            }
          }]
        },
        tooltips: {
          enabled: true,
          backgroundColor: '#ffffff',
          titleFontColor: '#1e293b',
          titleFontSize: 15,
          titleFontStyle: 'bold',
          titleSpacing: 6,
          bodyFontColor: '#4b5563',
          bodyFontSize: 13,
          bodySpacing: 6,
          xPadding: 20,
          yPadding: 20,
          cornerRadius: 16,
          displayColors: true,
          borderColor: '#f1f5f9',
          borderWidth: 2,
          intersect: false,
          mode: 'index',
          caretSize: 8,
          shadowOffsetX: 0,
          shadowOffsetY: 10,
          shadowBlur: 20,
          shadowColor: 'rgba(0, 0, 0, 0.1)',
          callbacks: {
            title: function(tooltipItems, data) {
              return tooltipItems[0].yLabel;
            },
            label: function(tooltipItem, data) {
              const dataset = data.datasets[tooltipItem.datasetIndex];
              const value = dataset.data[tooltipItem.index];
              
              const school = self.storedSchools[tooltipItem.index];
              const schoolStudents = self.storedStudents.filter(s => {
                const info = s.info || {};
                return (info.school?._id || info.school) === school._id;
              });
              const total = schoolStudents.length;
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              
              return ` ${dataset.label}: ${value.toLocaleString()} (${percentage}%)`;
            }
          }
        }
      };
    }
  },
  mounted() {
    this.onInit()
  },
  methods: {
    async onInit() {
      await Promise.all([
        this.$store.dispatch("academic/programs/programs"),
        this.$store.dispatch("academic/schools/schools"),
        this.$store.dispatch("member/students/students"),
        this.$store.dispatch("member/advisors/advisors"),
        this.$store.dispatch("competencies/general/general"),
        this.$store.dispatch("competencies/specific/specific")
      ]);

      // Set default year to the latest one available
      if (this.yearOptions.length > 0) {
        this.selectedYear = this.yearOptions[0].value;
      }
    },
    handleDownload(type) {
      if (type === 'json') {
        this.exportToJSON();
      } else {
        this.downloadReport(type);
      }
      this.showDownloadModal = false;
    },

    exportToJSON() {
      const dataStr = JSON.stringify(this.tableData, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `student_evaluation_data_${new Date().toISOString()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    },

    downloadReport(lang) {
      const students = this.filteredStudents;
      if (!students.length) return;

      // Build Label Dictionaries from active competency definitions to help legacy data
      const softDict = [];
      if (this.storedGeneral) {
        this.storedGeneral.filter(i => i.active).forEach(cat => {
          (cat.config || []).forEach(conf => {
            softDict.push(this.translate(conf.question, lang));
          });
        });
      }
      
      const hardDict = [];
      if (this.storedSpecific) {
        // We use all active specific questions as candidates
        this.storedSpecific.filter(i => i.active).forEach(cat => {
          (cat.config || []).forEach(conf => {
            hardDict.push(this.translate(conf.question, lang));
          });
        });
      }

      // Identify the max number of items for all categories and their unique titles from DB
      const softSkillMap = {}; 
      const hardSkillMap = {};
      const suggestionMap = {};

      students.forEach(s => {
        if (s.evaluation) {
          (s.evaluation.softskills || []).forEach((item, idx) => {
            if(!softSkillMap[idx]) softSkillMap[idx] = new Set();
            const ititle = item.answer?.title?.[lang] || item.answer?.title?.['en'] || item.answer?.title?.['th'] || '';
            if (ititle) softSkillMap[idx].add(ititle);
          });
          (s.evaluation.hardskills || []).forEach((item, idx) => {
            if(!hardSkillMap[idx]) hardSkillMap[idx] = new Set();
            const ititle = item.answer?.title?.[lang] || item.answer?.title?.['en'] || item.answer?.title?.['th'] || '';
            if (ititle) hardSkillMap[idx].add(ititle);
          });
          (s.evaluation.sugestion || []).forEach((item, idx) => {
            if(!suggestionMap[idx]) suggestionMap[idx] = new Set();
            const ititle = item.answer?.title?.[lang] || item.answer?.title?.['en'] || item.answer?.title?.['th'] || '';
            if (ititle) suggestionMap[idx].add(ititle);
          });
        }
      });

      // Build definitive header lists based on indices and Dictionary lookup
      const getDisplayHeader = (map, dict, prefix) => {
        return Object.keys(map).sort((a,b) => parseInt(a) - parseInt(b)).map(idxStr => {
          const idx = parseInt(idxStr);
          const titles = Array.from(map[idx]);
          let titleStr = titles.length === 1 ? titles[0] : titles.join(' / ');
          
          // If title seems too generic or matches category pattern, try to get detailed title from dictionary
          if (dict[idx] && (titleStr.length < 5 || titleStr.includes('Competencies'))) {
            titleStr = dict[idx];
          }

          return {
             idx: idx,
             label: `${prefix} ${idx + 1}: ${titleStr}`
          };
        });
      };

      const softHeaders = getDisplayHeader(softSkillMap, softDict, 'Soft Skill');
      const hardHeaders = getDisplayHeader(hardSkillMap, hardDict, 'Hard Skill');
      const suggHeaders = getDisplayHeader(suggestionMap, [], 'Suggestion');

      const getT = (t) => (Array.isArray(t) ? (t.find(x => x.key === lang) ?? t[0])?.value ?? '' : t ?? '');
      
      const data = students.map(s => {
        const info = s.info || {};
        const schoolQuery = info.school?._id || info.school;
        const school = (info.school && info.school.title) ? info.school : (this.storedSchools.find(sc => sc._id === schoolQuery) || {});
        
        const programQuery = info.program?._id || info.program;
        const program = (info.program && info.program.title) ? info.program : (this.storedPrograms.find(p => p._id === programQuery) || {});
        
        const advisor = this.storedAdvisors.find(a => a.student === s._id || a.student?._id === s._id);
        
        const row = {
          'Student ID': s.studentID || 'N/A',
          'Name (TH)': (s.name?.find?.(x => x.key === 'th') || {}).value || 'N/A',
          'Name (EN)': (s.name?.find?.(x => x.key === 'en') || {}).value || 'N/A',
          'School': getT(school.title) || 'N/A',
          'Program': getT(program.title) || 'N/A',
          'Academic Year': info.year || 'N/A',
          'Semester': info.semester || 'N/A',
          'Adviser Email': advisor ? advisor.email : 'N/A',
          'Evaluation Status': s.evaluation ? 'Complete' : 'Pending'
        };
        
        // Map scores by fixed indices to keep columns consistent
        softHeaders.forEach(h => {
          const item = s.evaluation?.softskills?.[h.idx];
          row[h.label] = item ? item.answer.score : '';
        });
        
        hardHeaders.forEach(h => {
          const item = s.evaluation?.hardskills?.[h.idx];
          row[h.label] = item ? item.answer.score : '';
        });
        
        suggHeaders.forEach(h => {
          const item = s.evaluation?.sugestion?.[h.idx];
          row[h.label] = item ? item.answer.value : '';
        });
        
        return row;
      });
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Evaluation Report");
      
      // Fine-tune column widths: headers can be long
      const wscols = Object.keys(data[0] || {}).map(key => ({ wch: Math.max(key.length, 15) }));
      worksheet['!cols'] = wscols;

      XLSX.writeFile(workbook, `Evaluation_Report_${this.moment().format('YYYY-MM-DD')}.xlsx`);
    },
    translate(data, key = 'th') {
      if (!data || !Array.isArray(data)) return data
      const found = data.find(i => i.key === key)
      return found ? found.value : (data[0] ? data[0].value : '')
    },
    handleStatusFilter(status) {
      if (status === 'all') {
        this.selectedEvaluated = '';
      } else {
        this.selectedEvaluated = status;
      }
    },
    viewDetails(item) {
      this.$router.push({
        path: `/administration/administrator/students/${item._id}`
      });
    }
  }
}
</script>


<style scoped>
.custom-card {
  border-radius: 20px !important;
}

.filter-label {
  font-size: 11px;
  font-weight: 800;
  color: #94a3b8;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 8px;
  display: block;
}

.modern-select {
  height: 48px !important;
  font-size: 14px !important;
  font-weight: 600;
  color: #1e293b !important;
  transition: all 0.2s;
  box-shadow: none !important;
  outline: none !important;
  margin-bottom: 0 !important; /* Remove the default form-group margin */
}

.modern-select:focus {
  background-color: #ffffff !important;
  border-color: #321fdb !important;
  box-shadow: 0 0 0 4px rgba(50, 31, 219, 0.1) !important;
}

.filter-group {
  /* Hover effect removed */
}

.header-card-accent {
  border-left: 6px solid #321fdb !important;
}

.dot-indicator {
  width: 8px;
  height: 8px;
  background-color: #22c55e;
  border-radius: 50%;
  box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.2);
}

.modern-modal-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  transition: all 0.2s !important;
}

.modern-modal-btn:hover {
  background-color: #321fdb !important;
  color: white !important;
}

.modern-header-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  transition: all 0.2s !important;
}

.modern-header-btn:hover {
  background-color: #321fdb !important;
  color: white !important;
  transform: translateY(-1px);
}

.modern-action-btn {
  border-radius: 8px !important;
  border: 1px solid #e2e8f0 !important;
  color: #64748b !important;
  transition: all 0.2s;
}

.modern-action-btn:hover {
  background-color: #321fdb !important;
  color: white !important;
  border-color: #321fdb !important;
  transform: scale(1.1);
}

.modern-timeline-group {
  display: flex !important;
  min-width: 380px;
}

.modern-timeline-btn {
  flex: 1 !important;
  white-space: nowrap !important;
  border-radius: 8px !important;
}

.modern-modal-btn {
  border-radius: 12px !important;
  font-weight: 600 !important;
  transition: all 0.2s !important;
}

.modern-modal-btn:hover {
  background-color: #321fdb !important;
  color: white !important;
}
</style>
