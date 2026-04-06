<template>
  <div>
    <HeroHeader @download-report="downloadReport" />
    <WidgetsDropdown 
      :schoolName="selectedSchoolName" 
      :total="totalStudentsCount"
      :evaluated="evaluatedCount"
      :notEvaluated="notEvaluatedCount"
      @filter-status="handleStatusFilter" 
    />
    <DashboardFilter 
      :school.sync="selectedSchool"
      :program.sync="selectedProgram"
      :year.sync="selectedYear"
      :evaluated.sync="selectedEvaluated"
      :schoolOptions="schoolOptions"
      :programOptions="programOptions"
      :yearOptions="yearOptions"
      :evaluatedOptions="evaluatedOptions"
    />
    
    <CRow>
      <CCol md="8">
        <CChartBar :labels="barChartData.labels" :datasets="barChartData.datasets" />
      </CCol>
      <CCol md="4">
        <CChartPie :labels="['Evaluated', 'Not Evaluated']" :datasets="pieChartData" />
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
      return found ? found.label : 'All Schools';
    },

    schoolOptions() {
      if (!this.storedSchools) return [{ value: '', label: 'All Schools' }];
      return [
        { value: '', label: 'All Schools' },
        ...this.storedSchools.map(s => ({
          value: s._id,
          label: s.title.find(t => t.key === 'en')?.value || s.title.find(t => t.key === 'th')?.value || s._id
        }))
      ];
    },

    barChartData() {
      // Group all students by school to show distribution
      const labels = [];
      const data = [];
      
      const schools = this.storedSchools || [];
      schools.forEach(school => {
        const label = school.title.find(t => t.key === 'en')?.value || school.title.find(t => t.key === 'th')?.value || school._id;
        labels.push(label);
        
        // Count students in this school that pass the current filters (except the school filter itself)
        const count = this.storedStudents.filter(student => {
          const info = student.info || {};
          // Only apply Program, Year, and Evaluated filters for the bar chart distribution
          if (this.selectedProgram && (info.program?._id || info.program) !== this.selectedProgram) return false;
          if (this.selectedYear && String(info.year) !== String(this.selectedYear)) return false;
          if (this.selectedEvaluated === 'evaluated') {
            if (!student.evaluation) return false;
          } else if (this.selectedEvaluated === 'not_evaluated') {
            if (student.evaluation) return false;
          }
          
          return (info.school?._id || info.school) === school._id;
        }).length;
        
        data.push(count);
      });

      return {
        labels,
        datasets: [
          {
            label: 'Students',
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
      const lang = this.$i18n.locale || 'en';
      let source = this.storedPrograms || [];

      if (this.selectedSchool) {
        source = source.filter(program => program.school === this.selectedSchool);
      }

      return [
        { value: '', label: 'All Programs' },
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
      if (!this.storedStudents || !this.storedStudents.length) return [{ value: '', label: 'All Years' }];
      const years = new Set(this.storedStudents.map(s => s.info?.year).filter(y => y));
      return [
        { value: '', label: 'All Years' },
        ...Array.from(years).sort().reverse().map(y => ({ value: y, label: String(y) }))
      ];
    },
    evaluatedOptions() {
      return [
        { value: '', label: 'All Status' },
        { value: 'evaluated', label: 'Evaluated' },
        { value: 'not_evaluated', label: 'Not Evaluated' }
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
      const lang = this.$i18n.locale || 'en';
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
    }
  }
}
</script>
