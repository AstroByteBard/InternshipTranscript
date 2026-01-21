<template>
  <div>
    <CRow>
      <CCol sm="12">
        <CCard>
          <CCardHeader>
            <div class="card-header-actions">
              <CButton color="primary" size="sm" @click="showImportModal = true">
                <CIcon name="cil-user-follow"/> Import Students
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
        <CTableWrapper
          :items="formattedStudents"
          :fields="studentFields"
          :loading="isLoading"
          hover
          striped
          bordered
          small
          fixed
          caption="StudentTable"
        />
        </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Import Modal -->
    <ImportStudentModal 
      :show.sync="showImportModal"
      @imported="onImportFile"
    />
  </div>
</template>

<script>
import CTableWrapper from './tables/Table.vue'
import ImportStudentModal from '../../views/Import/ImportStudentModal.vue'
import Service from '@/service/api.js'

export default {
  name: 'student',
  components: {
    CTableWrapper, 
    ImportStudentModal
  },
  data() {
    return {
      showImportModal: false,
      studentFields: [
        { key: 'studentID', label: 'STUDENT ID' },
        { key: 'displayName', label: 'NAME', _style: 'min-width:200px' },
        { key: 'email', label: 'EMAIL' },
        { key: 'schoolName', label: 'SCHOOL' },
        { key: 'majorName', label: 'MAJOR' },
        { key: 'info.year', label: 'ACADEMIC YEAR' }
      ],
      students: [],
      majors: [],
      schools: [],
      isLoading: false
    }
  },

  computed: {
    formattedStudents() {
      return this.students.map(student => {
        // ดึงชื่อภาษาไทย
        const displayName = this.getDisplayName(student.name)
        
        // ดึงชื่อ School
        const schoolName = this.getSchoolName(student.info && student.info.school)
        
        // ดึงชื่อ Major
        const majorName = this.getMajorName(student.info && student.info.major)

        return {
          ...student,
          displayName,
          schoolName,
          majorName
        }
      })
    }
  },

  async mounted() {
    await this.loadMasterData()
    await this.loadStudents()
  },

  methods: {
    getDisplayName(nameArray) {
      if (!nameArray || !Array.isArray(nameArray)) return '-'
      const nameTh = nameArray.find(n => n.key === 'th')
      return nameTh && nameTh.value ? nameTh.value : '-'
    },

    getSchoolName(school) {
      if (!school) return '-'
      
      // ถ้าเป็น ObjectId string
      if (typeof school === 'string') {
        const schoolObj = this.schools.find(s => s._id === school)
        return this.getTitleValue(schoolObj)
      }
      
      // ถ้าเป็น object ที่ populate แล้ว
      return this.getTitleValue(school)
    },

    getMajorName(major) {
      if (!major) return '-'
      
      // ถ้าเป็น ObjectId string
      if (typeof major === 'string') {
        const majorObj = this.majors.find(m => m._id === major)
        return this.getTitleValue(majorObj)
      }
      
      // ถ้าเป็น object ที่ populate แล้ว
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
        
        console.log('Loaded majors:', this.majors.length, 'schools:', this.schools.length)
      } catch (error) {
        console.error('Error loading master data:', error)
      }
    },

    async loadStudents() {
      this.isLoading = true
      try {
        const response = await Service.students('get')
        this.students = response.data?.data || response.data || []
        console.log('Loaded students:', this.students.length, 'records')
      } catch (error) {
        console.error('Error loading students:', error)
        alert('Failed to load students: ' + (error.response?.data?.message || error.message))
      } finally {
        this.isLoading = false
      }
    },
    
    onImportFile(result) {
      console.log('Import completed:', result)
      this.loadStudents()
    },

    onInit() {}
  }
}
</script>