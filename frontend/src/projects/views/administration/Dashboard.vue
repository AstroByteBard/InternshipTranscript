<template>
  <div>
    <HeroHeader @download-report="downloadReport" />
    <WidgetsDropdown :schoolName="selectedSchoolName" :total="totalStudentsCount" :evaluated="evaluatedCount"
      :notEvaluated="notEvaluatedCount" @filter-status="handleStatusFilter" />
    <DashboardFilter :school.sync="selectedSchool" :program.sync="selectedProgram" :year.sync="selectedYear"
      :evaluated.sync="selectedEvaluated" :schoolOptions="schoolOptions" :programOptions="programOptions"
      :yearOptions="yearOptions" :evaluatedOptions="evaluatedOptions" />

    <CRow>
      <CCol md="8">
        <CChartBar :labels="barChartData.labels" :datasets="barChartData.datasets" />
      </CCol>
      <CCol md="4">
        <CChartPie :labels="[$t('evaluated'), $t('not_evaluated')]" :datasets="pieChartData" />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import HeroHeader from '../../components/Layout/HeroHeader.vue'
import DashboardFilter from '../../components/Filter/DashboardFilter.vue'
import WidgetsDropdown from '../../components/widgets/WidgetsDashboard.vue'
import CChartBar from '../../components/charts/CChartBar'
import CChartPie from '../../components/charts/CChartPie'
import CChartLine from '../../components/charts/CChartLine'
import * as XLSX from "xlsx"

export default {
  name: 'Dashboard',
  components: {
    HeroHeader,
    DashboardFilter,
    WidgetsDropdown,
    CChartBar,
    CChartPie,
    CChartLine
  },
  data() {
    return {
      selectedSchool: '',
      selectedProgram: '',
      selectedYear: '',
      selectedEvaluated: '',
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
        if (this.selectedSchool && String(info.school?._id || info.school) !== String(this.selectedSchool)) return false;

        // Program Filter
        if (this.selectedProgram && String(info.program?._id || info.program) !== String(this.selectedProgram)) return false;

        // Year Filter
        if (this.selectedYear && String(this.getYearVal(info.year)) !== String(this.selectedYear)) return false;

        // Evaluated Filter (Logic: student.evaluation exists)
        if (this.selectedEvaluated === 'evaluated') {
          if (!student.evaluation) return false;
        } else if (this.selectedEvaluated === 'not_evaluated') {
          if (student.evaluation) return false;
        }

        return true;
      });
    },

    totalStudentsCount() {
      return (this.storedStudents || []).length;
    },

    evaluatedCount() {
      return (this.storedStudents || []).filter(s => s.evaluation).length;
    },

    notEvaluatedCount() {
      return (this.storedStudents || []).filter(s => !s.evaluation).length;
    },

    selectedSchoolName() {
      const found = this.schoolOptions.find(s => String(s.value) === String(this.selectedSchool));
      return found ? found.label : this.$t('all_schools_label');
    },

    schoolOptions() {
      if (!this.storedSchools) return [{ value: '', label: this.$t('all_schools_label') }];
      const lang = this.$store.getters['setting/lang'] || 'en';
      return [
        { value: '', label: this.$t('all_schools_label') },
        ...this.storedSchools.map(s => ({
          value: s._id,
          label: s.title.find(t => t.key === lang)?.value || s.title.find(t => t.key === 'en')?.value || s.title.find(t => t.key === 'th')?.value || s._id
        }))
      ];
    },

    barChartData() {
      // Group all students by school to show distribution
      const labels = [];
      const data = [];
      const lang = this.$store.getters['setting/lang'] || 'en';

      const schools = this.storedSchools || [];
      schools.forEach(school => {
        const label = school.title.find(t => t.key === lang)?.value || school.title.find(t => t.key === 'en')?.value || school.title.find(t => t.key === 'th')?.value || school._id;
        labels.push(label);

        // Count students in this school that pass the current filters (except the school filter itself)
        const count = this.storedStudents.filter(student => {
          const info = student.info || {};
          // Only apply Program, Year, and Evaluated filters for the bar chart distribution
          if (this.selectedProgram && String(info.program?._id || info.program) !== String(this.selectedProgram)) return false;
          if (this.selectedYear && String(this.getYearVal(info.year)) !== String(this.selectedYear)) return false;
          if (this.selectedEvaluated === 'evaluated') {
            if (!student.evaluation) return false;
          } else if (this.selectedEvaluated === 'not_evaluated') {
            if (student.evaluation) return false;
          }

          return String(info.school?._id || info.school) === String(school._id);
        }).length;

        data.push(count);
      });

      return {
        labels,
        datasets: [
          {
            label: this.$t('students'),
            backgroundColor: '#c83f36',
            data: data
          }
        ]
      };
    },

    pieChartData() {
      return [
        {
          backgroundColor: ['#2eb85c', '#f9b115'],
          data: [this.evaluatedCount, this.notEvaluatedCount],
          borderWidth: 0
        }
      ];
    },

    programOptions() {
      const lang = this.$store.getters['setting/lang'] || 'en';
      let source = this.storedPrograms || [];

      if (this.selectedSchool) {
        source = source.filter(program => program.school === this.selectedSchool);
      }

      return [
        { value: '', label: this.$t('all_programs_label') },
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
      if (!this.storedStudents || !this.storedStudents.length) return [{ value: '', label: this.$t('all_years_label') }];
      const years = new Set(this.storedStudents.map(s => this.getYearVal(s.info?.year)).filter(y => y));
      return [
        { value: '', label: this.$t('all_years_label') },
        ...Array.from(years).sort().reverse().map(y => ({ value: y, label: String(y) }))
      ];
    },
    evaluatedOptions() {
      return [
        { value: '', label: this.$t('all_status_label') },
        { value: 'evaluated', label: this.$t('evaluated') },
        { value: 'not_evaluated', label: this.$t('not_evaluated') }
      ];
    }
  },
  mounted() {
    this.onInit()
  },
  methods: {
    onInit() {
      this.$store.dispatch("academic/programs/programs")
      this.$store.dispatch("academic/schools/schools")
      this.$store.dispatch("member/students/students")
      this.$store.dispatch("member/advisors/advisors")
      this.$store.dispatch("competencies/general/general")
      this.$store.dispatch("competencies/specific/specific")
    },
    downloadReport() {
      const lang = this.$store.getters['setting/lang'] || 'en';
      const students = this.storedStudents || [];
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
        this.storedSpecific.filter(i => i.active).forEach(cat => {
          (cat.config || []).forEach(conf => {
            hardDict.push(this.translate(conf.question, lang));
          });
        });
      }

      const getT = (t) => (Array.isArray(t) ? (t.find(x => x.key === lang) ?? t[0])?.value ?? '' : t ?? '');

      const getDisplayHeader = (map, dict, prefix) => {
        return Object.keys(map).sort((a, b) => parseInt(a) - parseInt(b)).map(idxStr => {
          const idx = parseInt(idxStr);
          const titles = Array.from(map[idx]);
          let titleStr = titles.length === 1 ? titles[0] : titles.join(' / ');

          if (dict[idx] && (titleStr.length < 5 || titleStr.includes('Competencies'))) {
            titleStr = dict[idx];
          }

          return { idx: idx, label: `${prefix} ${idx + 1}: ${titleStr}` };
        });
      };

      const buildSuggestionHeaders = (map) => {
        const result = [];
        Object.keys(map).sort((a, b) => parseInt(a) - parseInt(b)).forEach(idxStr => {
          const idx = parseInt(idxStr);
          const titles = Array.from(map[idx]);
          let titleStr = titles.length === 1 ? titles[0] : titles.join(' / ');
          const baseLabel = titleStr || `Item ${idx + 1}`;
          result.push({ idx, bucket: 'outstanding', subIdx: 0, label: `Outstanding 1: ${baseLabel}` });
          result.push({ idx, bucket: 'outstanding', subIdx: 1, label: `Outstanding 2: ${baseLabel}` });
          result.push({ idx, bucket: 'outstanding', subIdx: 2, label: `Outstanding 3: ${baseLabel}` });
          result.push({ idx, bucket: 'opportunity', subIdx: 0, label: `Opportunity 1: ${baseLabel}` });
          result.push({ idx, bucket: 'opportunity', subIdx: 1, label: `Opportunity 2: ${baseLabel}` });
          result.push({ idx, bucket: 'opportunity', subIdx: 2, label: `Opportunity 3: ${baseLabel}` });
        });
        return result;
      };

      const getSuggestionCell = (item, bucket, subIdx) => {
        if (!item) return '';
        const v = item.answer?.value;
        if (!v) return '';
        if (typeof v === 'string') return bucket === 'outstanding' ? v : '';
        if (typeof v === 'object') {
          const bucketData = v[bucket];
          if (!bucketData) return '';
          const entry = bucketData.items?.[subIdx];
          if (!entry) return '';
          const c = entry.content;
          if (typeof c === 'string') return c;
          return c?.en || c?.th || '';
        }
        return '';
      };

      const buildHeaders = (groupStudents) => {
        const softSkillMap = {};
        const hardSkillMap = {};
        const suggestionMap = {};

        groupStudents.forEach(s => {
          if (s.evaluation) {
            (s.evaluation.softskills || []).forEach((item, idx) => {
              if (!softSkillMap[idx]) softSkillMap[idx] = new Set();
              const ititle = item.answer?.title?.[lang] || item.answer?.title?.['en'] || item.answer?.title?.['th'] || '';
              if (ititle) softSkillMap[idx].add(ititle);
            });
            (s.evaluation.hardskills || []).forEach((item, idx) => {
              if (!hardSkillMap[idx]) hardSkillMap[idx] = new Set();
              const ititle = item.answer?.title?.[lang] || item.answer?.title?.['en'] || item.answer?.title?.['th'] || '';
              if (ititle) hardSkillMap[idx].add(ititle);
            });
            (s.evaluation.sugestion || []).forEach((item, idx) => {
              if (!suggestionMap[idx]) suggestionMap[idx] = new Set();
              const ititle = item.answer?.title?.[lang] || item.answer?.title?.['en'] || item.answer?.title?.['th'] || '';
              if (ititle) suggestionMap[idx].add(ititle);
            });
          }
        });

        return {
          softHeaders: getDisplayHeader(softSkillMap, softDict, 'Soft Skill'),
          hardHeaders: getDisplayHeader(hardSkillMap, hardDict, 'Hard Skill'),
          suggHeaders: buildSuggestionHeaders(suggestionMap)
        };
      };

      const buildRow = (s, softHeaders, hardHeaders, suggHeaders) => {
        const info = s.info || {};
        const schoolQuery = info.school?._id || info.school;
        const school = (info.school && info.school.title) ? info.school : (this.storedSchools.find(sc => String(sc._id) === String(schoolQuery)) || {});

        const programQuery = info.program?._id || info.program;
        const program = (info.program && info.program.title) ? info.program : (this.storedPrograms.find(p => String(p._id) === String(programQuery)) || {});

        const advisor = this.storedAdvisors.find(a => String(a.student?._id || a.student) === String(s._id));

        const row = {
          'Student ID': s.studentID || 'N/A',
          'Name (TH)': (s.name?.find?.(x => x.key === 'th') || {}).value || 'N/A',
          'Name (EN)': (s.name?.find?.(x => x.key === 'en') || {}).value || 'N/A',
          'School': getT(school.title) || 'N/A',
          'Program': getT(program.title) || 'N/A',
          'Academic Year': this.getYearVal(info.year) || 'N/A',
          'Semester': getT(info.semester?.title) || 'N/A',
          'Adviser Email': advisor ? advisor.email : 'N/A',
          'Evaluation Status': s.evaluation ? 'Complete' : 'Pending'
        };

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
          row[h.label] = getSuggestionCell(item, h.bucket, h.subIdx);
        });

        return row;
      };

      // Group students by program name
      const groups = {};
      students.forEach(s => {
        const info = s.info || {};
        const programQuery = info.program?._id || info.program;
        const program = (info.program && info.program.title) ? info.program : (this.storedPrograms.find(p => String(p._id) === String(programQuery)) || {});
        const programName = getT(program.title) || 'No Program';
        if (!groups[programName]) groups[programName] = [];
        groups[programName].push(s);
      });

      const sortedGroups = Object.keys(groups).sort();

      const sanitizeSheetName = (name) => {
        const cleaned = name.replace(/[*?:\[\]\/\\]/g, ' ').trim();
        return cleaned.length > 31 ? cleaned.substring(0, 31) : cleaned;
      };

      const workbook = XLSX.utils.book_new();

      sortedGroups.forEach(programName => {
        const groupStudents = groups[programName];
        const { softHeaders, hardHeaders, suggHeaders } = buildHeaders(groupStudents);
        const sheetData = groupStudents.map(s => buildRow(s, softHeaders, hardHeaders, suggHeaders));
        const worksheet = XLSX.utils.json_to_sheet(sheetData);

        const sheetName = sanitizeSheetName(programName);
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

        const wscols = Object.keys(sheetData[0] || {}).map(key => ({ wch: Math.max(key.length, key === 'Adviser Email' ? 28 : 15) }));
        worksheet['!cols'] = wscols;
      });

      XLSX.writeFile(workbook, `Evaluation_Report_${this.moment().format('YYYY-MM-DD')}.xlsx`);
    },
    translate(data, key = 'th') {
      if (!data || !Array.isArray(data)) return data
      const found = data.find(i => i.key === key)
      return found ? found.value : (data[0] ? data[0].value : '')
    },
    getYearVal(yr) {
      if (Array.isArray(yr)) {
        const found = yr.find(y => y.key === 'en') || yr[0];
        return found ? found.value : '';
      }
      if (yr && typeof yr === 'object') return yr.value || '';
      return yr || '';
    },
    handleStatusFilter(status) {
      if (status === 'all') {
        this.selectedEvaluated = '';
      } else {
        this.selectedEvaluated = status;
      }
    }
  }
}
</script>
