<template>
  <div>
    <div class="d-flex justify-content-end  mb-4">
      <CButton color="danger" class="px-4 text-white font-weight-bold"
        style="background-color: #b91c1c; border-color: #b91c1c;">
        Download Report
      </CButton>
    </div>

    <CCard class="rounded shadow-sm mb-4">
      <CCardBody class="p-3">
        <CRow>
          <CCol md="4">
            <CSelect custom class="mb-0" :options="schoolOptions" :value.sync="selectedSchool" />
          </CCol>
          <CCol md="4">
            <CSelect custom class="mb-0" :options="programOptions" :value.sync="selectedProgram" />
          </CCol>
          <CCol md="4">
            <CSelect custom class="mb-0" :options="yearOptions" :value.sync="s2electedYear" />
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <WidgetsDropdown />
    <CRow>
      <CCol md="8">
        <CChartBar />
      </CCol>
      <CCol md="4">
        <CChartPie />
      </CCol>
    </CRow>
    <CChartLine />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import WidgetsDropdown from '../../components/widgets/WidgetsDropdown.vue'
import CChartBar from '../../components/charts/CChartBar'
import CChartPie from '../../components/charts/CChartPie'
import CChartLine from '../../components/charts/CChartLine'

export default {
  name: 'Dashboard',
  components: {
    WidgetsDropdown,
    CChartBar,
    CChartPie,
    CChartLine
  },
  data() {
    return {
      selectedSchool: '',
      selectedProgram: '',
      selectedYear: ''
    }
  },
  computed: {
    ...mapGetters('academic/schools', { storedSchools: 'schools' }),
    ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
    ...mapGetters('member/students', { storedStudents: 'students' }),

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
      // Extract unique years from student data
      const years = new Set(this.storedStudents.map(s => s.info?.year).filter(y => y));
      return [
        { value: '', label: 'All Years' },
        ...Array.from(years).sort().reverse().map(y => ({ value: y, label: String(y) }))
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
      this.$store.dispatch("administrator/student")
    }
  }
}
</script>
