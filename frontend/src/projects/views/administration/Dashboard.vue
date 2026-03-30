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
      // Default status ID for "Not Evaluated"
      NOT_EVALUATED_STATUS: '689c04cb255db4e56aea88ef'
    }
  },
  computed: {
    ...mapGetters('academic/schools', { storedSchools: 'schools' }),
    ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
    ...mapGetters('member/students', { storedStudents: 'students' }),

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
        
        // Evaluated Filter (Logic: default status ID is not evaluated)
        if (this.selectedEvaluated === 'evaluated') {
          if ((student.status?._id || student.status) === this.NOT_EVALUATED_STATUS) return false;
        } else if (this.selectedEvaluated === 'not_evaluated') {
          if ((student.status?._id || student.status) !== this.NOT_EVALUATED_STATUS) return false;
        }
        
        return true;
      });
    },

    totalStudentsCount() {
      return this.filteredStudents.length;
    },

    evaluatedCount() {
      return this.filteredStudents.filter(s => (s.status?._id || s.status) !== this.NOT_EVALUATED_STATUS).length;
    },

    notEvaluatedCount() {
      return this.filteredStudents.filter(s => (s.status?._id || s.status) === this.NOT_EVALUATED_STATUS).length;
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
            if ((student.status?._id || student.status) === this.NOT_EVALUATED_STATUS) return false;
          } else if (this.selectedEvaluated === 'not_evaluated') {
            if ((student.status?._id || student.status) !== this.NOT_EVALUATED_STATUS) return false;
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
    },
    downloadReport() {
      console.log("Generating report...");
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
