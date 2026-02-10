<template>
  <div>
    <CRow class="d-flex justify-content-end">
      <CCol col="auto">
        <CButton color="primary" size="sm" @click="showImportModal = true">
          <CIcon name="cil-user-follow" /> Import Students
        </CButton>
      </CCol>
    </CRow>
    <CRow>
      <CCol sm="12">
        <!-- Filter Section -->
        <StudentFilter :schools="school" :majors="major" :courses="courses" @filter="onFilter" />
        <CCardBody>
        </CCardBody>
      </CCol>
    </CRow>

    <!-- Modals... -->
    <ImportStudentModal :show.sync="showImportModal" @imported="onImportFile" />
    <EditStudentModal :show.sync="showEditModal" :student="editStudent" @save="saveEdit" />
    <DeleteStudentModal :show.sync="showDeleteModal" :student="deleteStudent" @confirm="confirmDelete" />
  </div>
</template>

<script>
import ImportStudentModal from '../../views/Import/ImportStudentModal.vue'
import EditStudentModal from '@/views/modal/EditStudentModal.vue'
import DeleteStudentModal from '@/views/modal/DeleteStudentModal.vue'
import StudentFilter from '@/projects/components/Filter/StudentFilter.vue'
import { mapActions, mapGetters } from 'vuex'

export default {
  name: 'student',
  components: {
    ImportStudentModal,
    EditStudentModal,
    DeleteStudentModal,
    StudentFilter
  },
  data() {
    return {
      showImportModal: false,
      showEditModal: false,
      showDeleteModal: false,
      editStudent: null,
      deleteStudent: null,
      studentFields: [
        { key: 'studentID', label: 'STUDENT ID' },
        { key: 'nameTh', label: 'NAME TH', _style: 'min-width:200px' },
        { key: 'nameEn', label: 'NAME EN', _style: 'min-width:200px' },
        { key: 'email', label: 'STUDENT EMAIL' },
        { key: 'info.advisor', label: 'ADVISOR EMAIL' },
        { key: 'schoolName', label: 'SCHOOL' },
        { key: 'majorName', label: 'PROGRAM' },
        { key: 'year', label: 'YEAR' },
        { key: 'semester', label: 'SEMESTER' },
        { key: 'course', label: 'COURSE' },
        { key: 'actions', label: 'ACTIONS', _style: 'width:100px' }
      ],
      courses: [],
      currentFilters: {}
    }
  },

  computed: {
    ...mapGetters('academic', ['school', 'major']),
    ...mapGetters('students', ['students']),


    studentsWithNames() {
      const schools = this.school || [];
      const majors = this.major || [];
      function getStudentNameByLang(nameArr, lang) {
        if (!Array.isArray(nameArr)) return '-';
        const found = nameArr.find(nameObj => nameObj.key === lang);
        return found && found.value ? found.value : '-';
      }
      function getSchoolName(schoolId) {
        const school = schools.find(
          schoolItem => String(schoolItem._id) === String(schoolId)
        );
        if (!school) return '-';
        const titleTh = (school.title || []).find(titleObj => titleObj.key === 'th');
        return titleTh ? titleTh.value : '-';
      }
      function getMajorName(majorId) {
        const major = majors.find(
          majorItem => String(majorItem._id) === String(majorId)
        );
        if (!major) return '-';
        const titleTh = (major.title || []).find(titleObj => titleObj.key === 'th');
        return titleTh ? titleTh.value : '-';
      }
      return (this.students || []).map(student => ({
        ...student,
        nameTh: getStudentNameByLang(student.name, 'th'),
        nameEn: getStudentNameByLang(student.name, 'en'),
        school: student.info?.school || '-',
        schoolName: getSchoolName(student.info?.school),
        major: student.info?.major || '-',
        majorName: getMajorName(student.info?.major),
        year: student.info?.year || '-',
        semester: student.info?.semester || '-',
        course: student.info?.course || '-'
      }));
    },

    filteredStudents() {
      let filtered = this.studentsWithNames;

      if (this.currentFilters.search) {
        const search = this.currentFilters.search.toLowerCase()
        filtered = filtered.filter(searchs =>
          searchs.studentID.toLowerCase().includes(search) ||
          searchs.nameTh.toLowerCase().includes(search) ||
          searchs.nameEn.toLowerCase().includes(search) ||
          searchs.email.toLowerCase().includes(search)
        )
      }

      if (this.currentFilters.school) {
        filtered = filtered.filter(searchs =>
          searchs.school === this.currentFilters.school
        )
      }

      if (this.currentFilters.major) {
        filtered = filtered.filter(searchs =>
          searchs.major === this.currentFilters.major
        )
      }

      if (this.currentFilters.year) {
        filtered = filtered.filter(searchs =>
          searchs.year === String(this.currentFilters.year)
        )
      }

      if (this.currentFilters.semester) {
        filtered = filtered.filter(searchs =>
          searchs.semester === this.currentFilters.semester
        )
      }

      return filtered
    }
  },

  async mounted() {
    await this.getSchoolandMajor()
    await this.getstudents()
  },

  methods: {
    ...mapActions('academic', {
      loadMajors: 'major',
      loadSchools: 'school'
    }),

    ...mapActions('students', {
      getstudents: 'getstudents',
      updateStudentAction: 'updateStudent',
      deleteStudentAction: 'deleteStudent'
    }),

    async getSchoolandMajor() {
      try {
        await Promise.all([
          this.loadMajors(),
          this.loadSchools()
        ])
      } catch (error) {
        console.error('Error loading master data:', error)
      }
    },

    onFilter(filters) {
      this.currentFilters = { ...filters }
    },

    openEditModal(student) {
      const nameTh = student.name.find(n => n.key === 'th')
      const nameEn = student.name.find(n => n.key === 'en')

      this.editStudent = {
        _id: student._id,
        studentID: student.studentID,
        email: student.email,
        name_th: nameTh ? nameTh.value : '',
        name_en: nameEn ? nameEn.value : '',
        school: student.info.school,
        major: student.info.major,
        year: student.info.year,
        semester: student.info.semester || 1
      }
      this.showEditModal = true
    },

    openDeleteModal(student) {
      this.deleteStudent = student
      this.showDeleteModal = true
    },

    async saveEdit(student) {
      if (!student) return

      try {
        const updateData = {
          _id: student._id,
          studentID: student.studentID,
          email: student.email,
          name: [
            { key: 'th', value: student.name_th },
            { key: 'en', value: student.name_en }
          ],
          info: {
            semester: student.semester,
            major: student.major,
            school: student.school,
            year: student.year
          }
        }

        await this.updateStudentAction(updateData)
        await this.getstudents()
        this.showEditModal = false

        alert('Updated successfully')
      } catch (error) {
        console.error('Error updating student:', error)
        alert('Error: ' + (error.response?.data?.message || error.message))
      }
    },

    async confirmDelete(student) {
      await this.deleteStudentAction({ id: student._id })
      await this.getstudents()
      this.showDeleteModal = false

    },

    async onImportFile() {
      await this.getstudents()
      // window.location.reload() // Uncomment if you want a hard refresh
    }
  }

}

</script>