<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CCard>
          <CCardHeader>
            <div class="card-header-actions">
              <CButton color="primary" size="sm" @click="showImportModal = true">
                <CIcon name="cil-user-follow" /> Import Advisors
              </CButton>
            </div>
          </CCardHeader>
          <!-- Filter Section -->
    <StudentFilter 
      :schools="schools"
      :majors="majors"
      :courses="courses"
      @filter="onFilter"
    />
          <CCardBody>
            <CTableWrapper 
              :items="filteredStudents" 
              :fields="studentFields" 
              :loading="isLoading" 
              hover 
              striped
              bordered 
              small 
              fixed 
              caption="StudentTable"
            >
              <template #actions="{ item }">
                <CButton color="info" size="sm" @click="openEditModal(item)" class="mr-1">
                  <CIcon name="cil-pencil" />
                </CButton>
                <CButton color="danger" size="sm" @click="openDeleteModal(item)">
                  <CIcon name="cil-trash" />
                </CButton>
              </template>
            </CTableWrapper>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Modals... -->
    <ImportStudentModal :show.sync="showImportModal" @imported="onImportFile" />
    <EditStudentModal :show.sync="showEditModal" :student="editStudent" @save="saveEdit" />
    <DeleteStudentModal :show.sync="showDeleteModal" :student="deleteStudent" @confirm="confirmDelete" />
  </div>
</template>

<script>
import CTableWrapper from './tables/Table.vue'
import ImportStudentModal from '../../views/Import/ImportStudentModal.vue'
import EditStudentModal from '@/views/modal/EditStudentModal.vue'
import DeleteStudentModal from '@/views/modal/DeleteStudentModal.vue'
import StudentFilter from '@/projects/components/Filter/StudentFilter.vue'
import Service from '@/service/api.js'

export default {
  name: 'student',
  components: {
    CTableWrapper,
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
        { key: 'displayName', label: 'NAME', _style: 'min-width:200px' },
        { key: 'email', label: 'EMAIL' },
        { key: 'schoolName', label: 'SCHOOL' },
        { key: 'majorName', label: 'PROGRAM' },
        { key: 'info.year', label: 'YEAR' },
        { key: 'info.semester', label: 'SEMESTER' },
        { key: 'info.course', label: 'COURSE' },
        { key: 'actions', label: 'ACTIONS', _style: 'width:100px' }
      ],
      students: [],
      majors: [],
      schools: [],
      courses: [],
      isLoading: false,
      currentFilters: {}
    }
  },

  computed: {
    formattedStudents() {
      return this.students.map(student => {
        const displayName = this.getDisplayName(student.name)
        const schoolName = this.getSchoolName(student.info && student.info.school)
        const majorName = this.getMajorName(student.info && student.info.major)

        return {
          ...student,
          displayName,
          schoolName,
          majorName
        }
      })
    },

    filteredStudents() {
      let filtered = this.formattedStudents

      // Search filter
      if (this.currentFilters.search) {
        const search = this.currentFilters.search.toLowerCase()
        filtered = filtered.filter(s => 
          s.studentID.toLowerCase().includes(search) ||
          s.displayName.toLowerCase().includes(search) ||
          s.email.toLowerCase().includes(search)
        )
      }

      // School filter
      if (this.currentFilters.school) {
        filtered = filtered.filter(s => 
          s.info.school === this.currentFilters.school
        )
      }

      // Major filter
      if (this.currentFilters.major) {
        filtered = filtered.filter(s => 
          s.info.major === this.currentFilters.major
        )
      }

      // Year filter
      if (this.currentFilters.year) {
        filtered = filtered.filter(s => 
          s.info.year === String(this.currentFilters.year)
        )
      }

      // Semester filter
      if (this.currentFilters.semester) {
        filtered = filtered.filter(s => 
          s.info.semester === this.currentFilters.semester
        )
      }

      return filtered
    }
  },

  async mounted() {
    await this.loadMasterData()
    await this.loadStudents()
  },

  methods: {
    // ... methods เดิมทั้งหมด

    onFilter(filters) {
      console.log('Applying filters:', filters)
      this.currentFilters = { ...filters }
    },

    getDisplayName(nameArray) {
      if (!nameArray || !Array.isArray(nameArray)) return '-'
      const nameTh = nameArray.find(n => n.key === 'th')
      return nameTh && nameTh.value ? nameTh.value : '-'
    },

    getSchoolName(school) {
      if (!school) return '-'
      if (typeof school === 'string') {
        const schoolObj = this.schools.find(s => s._id === school)
        return this.getTitleValue(schoolObj)
      }
      return this.getTitleValue(school)
    },

    getMajorName(major) {
      if (!major) return '-'
      if (typeof major === 'string') {
        const majorObj = this.majors.find(m => m._id === major)
        return this.getTitleValue(majorObj)
      }
      return this.getTitleValue(major)
    },

    getTitleValue(obj) {
      if (!obj || !obj.title || !Array.isArray(obj.title)) return '-'
      const titleTh = obj.title.find(t => t.key === 'th')
      const titleEn = obj.title.find(t => t.key === 'en')
      return (titleTh && titleTh.value) || (titleEn && titleEn.value) || '-'
    },

    async loadMasterData() {
      try {
        const [majorResponse, schoolResponse] = await Promise.all([
          Service.major('get'),
          Service.school('get')
        ])

        this.majors = majorResponse.data?.data || majorResponse.data || []
        this.schools = schoolResponse.data?.data || schoolResponse.data || []
      } catch (error) {
        console.error('Error loading master data:', error)
      }
    },

    async loadStudents() {
      this.isLoading = true
      try {
        const response = await Service.students('get')
        this.students = response.data?.data || response.data || []
      } catch (error) {
        console.error('Error loading students:', error)
        alert('Failed to load students: ' + (error.response?.data?.message || error.message))
      } finally {
        this.isLoading = false
      }
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

        await Service.students('put', updateData)
        alert('Updated successfully')
        this.showEditModal = false
        this.loadStudents()
      } catch (error) {
        console.error('Error updating student:', error)
        alert('Error: ' + (error.response?.data?.message || error.message))
      }
    },

    openDeleteModal(student) {
      this.deleteStudent = student
      this.showDeleteModal = true
    },

    async confirmDelete(student) {
      if (!student || !student._id) return

      try {
        await Service.students('delete', { _id: student._id })
        const index = this.students.findIndex(s => s._id === student._id)
        if (index > -1) {
          this.students.splice(index, 1)
        }
        this.showDeleteModal = false
        this.deleteStudent = null
        alert('Deleted successfully')
      } catch (error) {
        alert('Error: ' + (error.response?.data?.message || error.message))
      }
    },

    onImportFile(result) {
      this.loadStudents()
    }
  }
}
</script>