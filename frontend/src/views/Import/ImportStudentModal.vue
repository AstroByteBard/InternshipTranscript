<template>
  <div>
    <CModal :show.sync="isVisible" :centered="true" size="lg" color="primary">
      <template #header>
        <h6 class="modal-title">
          <CIcon name="cil-file-add" /> Import Students
        </h6>
        <CButtonClose @click="close" class="text-white" />
      </template>

      <CRow>
        <CCol sm="12">
          <p class="mb-3">Please select a CSV or Excel file to import student data.</p>
          <p class="mb-2 text-muted small">
            <strong>Required columns:</strong> ID, Email<br>
            <strong>Optional columns:</strong> Name-Surname (Thai), Name-Surname (English), Program, School, Course,
            Organization name, Semester, Year
          </p>
          <CInputFile label="Select File" placeholder="Choose file..." @change="handleFileUpload"
            :disabled="isProcessing" custom />
          <div v-if="uploadedFile" class="mt-2">
            <small class="text-success">
              <CIcon name="cil-check-circle" /> Selected: {{ uploadedFile.name }}
            </small>
          </div>
          <div v-if="isProcessing" class="mt-3">
            <CProgress :value="100" color="primary" animated class="mb-2" />
            <small class="text-muted">Processing... Please wait.</small>
          </div>
        </CCol>
      </CRow>

      <template #footer>
        <CButton @click="close" color="secondary" :disabled="isProcessing">
          <CIcon name="cil-ban" /> Cancel
        </CButton>
        <CButton @click="onImport" color="success" :disabled="isProcessing || !uploadedFile">
          <CIcon name="cil-check" /> {{ isProcessing ? 'Importing...' : 'Import' }}
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
import Service from '@/service/api.js'
import * as XLSX from 'xlsx'
import { mapState, mapActions } from 'vuex'

export default {
  name: 'ImportStudentModal',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      uploadedFile: null,
      isProcessing: false
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.show
      },
      set(value) {
        if (!value) {
          this.close()
        }
      }
    },
    // ใช้ state จาก store แทน
    ...mapState('academic', {
      majors: state => state.major,
      schools: state => state.school
    })
  },
  async mounted() {
    // โหลดข้อมูล major และ school ตอน modal เปิด
    await this.getSchoolAndMajor()
  },
  methods: {
    // ใช้ actions จาก store
    ...mapActions('academic', {
      loadMajors: 'major',
      loadSchools: 'school'
    }),

    async getSchoolAndMajor() {
      try {
        await Promise.all([
          this.loadMajors(),
          this.loadSchools()
        ])
      } catch (error) {
        console.error('Error loading master data:', error)
      }
    },

    findMajorId(programName) {
      if (!programName) return null

      const major = this.majors.find(m => {
        const titleTh = m.title?.find(t => t.key === 'th')?.value || ''
        const titleEn = m.title?.find(t => t.key === 'en')?.value || ''

        return titleTh.toLowerCase().includes(programName.toLowerCase()) ||
          titleEn.toLowerCase().includes(programName.toLowerCase()) ||
          programName.toLowerCase().includes(titleTh.toLowerCase()) ||
          programName.toLowerCase().includes(titleEn.toLowerCase())
      })

      return major?._id || null
    },

    findSchoolId(schoolName) {
      if (!schoolName) return null

      const school = this.schools.find(s => {
        const titleTh = s.title?.find(t => t.key === 'th')?.value || ''
        const titleEn = s.title?.find(t => t.key === 'en')?.value || ''

        return titleTh.toLowerCase().includes(schoolName.toLowerCase()) ||
          titleEn.toLowerCase().includes(schoolName.toLowerCase()) ||
          schoolName.toLowerCase().includes(titleTh.toLowerCase()) ||
          schoolName.toLowerCase().includes(titleEn.toLowerCase())
      })

      return school?._id || null
    },

    handleFileUpload(event) {
      console.log('change payload:', event)

      if (event instanceof FileList && event.length > 0) {
        this.uploadedFile = event[0]
      } else if (Array.isArray(event) && event.length > 0) {
        this.uploadedFile = event[0]
      } else if (event && event.target && event.target.files) {
        this.uploadedFile = event.target.files[0]
      } else if (event && event.dataTransfer && event.dataTransfer.files) {
        this.uploadedFile = event.dataTransfer.files[0]
      }
    },

    async onImport() {
      if (!this.uploadedFile) {
        alert('Please select a file first')
        return
      }
      if (this.isProcessing) {
        return
      }

      this.isProcessing = true
      try {
        const data = await this.readExcelFile(this.uploadedFile)

        if (!data || data.length === 0) {
          alert('No data found in the file')
          this.isProcessing = false
          return
        }

        const students = this.transformData(data)

        let successCount = 0
        let failCount = 0
        const errors = []

        for (let studentIndex = 0; studentIndex < students.length; studentIndex++) {
          const currentStudent = students[studentIndex]
          try {
            await Service.students('post', currentStudent)
            successCount++
            console.log(`Imported: ${currentStudent.studentID}`)
          } catch (error) {
            failCount++
            errors.push({
              row: studentIndex + 2,
              studentID: currentStudent.studentID,
              message: error.response?.data?.message || error.message
            })
            console.error(`Failed: ${currentStudent.studentID}`, error.message)
          }
        }

        let resultMessage = `Import completed!\n\nTotal: ${data.length}\nSuccess: ${successCount}\nFailed: ${failCount}`

        if (errors.length > 0) {
          resultMessage += '\n\nErrors:\n'
          errors.slice(0, 5).forEach(err => {
            resultMessage += `Row ${err.row} (${err.studentID}): ${err.message}\n`
          })
          if (errors.length > 5) {
            resultMessage += `...and ${errors.length - 5} more errors`
          }
        }

        alert(resultMessage)

        this.uploadedFile = null
        this.isProcessing = false
        this.close()

        this.$emit('imported', { success: successCount, failed: failCount })

      } catch (error) {
        console.error('Import error:', error)
        alert('Failed to import: ' + error.message)
        this.isProcessing = false
      }
    },

    readExcelFile(file) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader()

        reader.onload = (e) => {
          try {
            const data = new Uint8Array(e.target.result)
            const workbook = XLSX.read(data, { type: 'array' })

            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]

            const jsonData = XLSX.utils.sheet_to_json(worksheet)

            resolve(jsonData)
          } catch (error) {
            reject(error)
          }
        }

        reader.onerror = (error) => reject(error)
        reader.readAsArrayBuffer(file)
      })
    },

    transformData(data) {
      if (data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]))
      }

      return data.map((row, index) => {
        if (index === 0) {
          console.log('First row data:', row)
        }

        let studentID = row['ID'] || row.id || row.studentID || row.StudentID
        const nameThai = row['Name-Surname (Thai)'] || row.name_th || row.NameTH || ''
        const nameEnglish = row['Name-Surname (English)'] || row.name_en || row.NameEN || ''
        let email = row['Email'] || row.email || `${studentID}@lamduan.mfu.ac.th`
        const programData = row['Program'] || row.Programe || row.program || row.major
        const schoolData = row['School'] || row.school
        const courseData = row['Course'] || row.course
        const organizationName = row['Organization name'] || row.organization || ''
        const semester = row['Semester'] || row.semester || 1
        const year = row['Year'] || row.year || new Date().getFullYear()

        const majorId = this.findMajorId(programData)
        const schoolId = this.findSchoolId(schoolData)

        const student = {
          studentID: studentID ? String(studentID) : '',
          name: [
            { key: 'th', value: nameThai },
            { key: 'en', value: nameEnglish }
          ],
          email: email,
          info: {
            semester: Number(semester) || 1,
            major: majorId,
            school: schoolId,
            year: String(year),
            course: courseData || '',
            organization: organizationName
          }
        }

        return student
      }).filter(student => student.studentID && student.email)
    },

    close() {
      this.uploadedFile = null
      this.isProcessing = false
      this.$emit('update:show', false)
    }
  }
}
</script>