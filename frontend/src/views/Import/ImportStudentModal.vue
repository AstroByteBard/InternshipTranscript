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
            <strong>Required columns:</strong> studentID, email<br>
            <strong>Optional columns:</strong> name_th, name_en, semester, year, major, school
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
      isProcessing: false,
      majors: [],
      schools: []
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
    }
  },
  async mounted() {
    // โหลดข้อมูล major และ school ตอน modal เปิด
    await this.loadMasterData()
  },
  methods: {
    async loadMasterData() {
      try {
        // โหลดข้อมูล majors
        const majorResponse = await Service.major('get')
        this.majors = majorResponse.data?.data || majorResponse.data || []
        
        // โหลดข้อมูล schools
        const schoolResponse = await Service.school('get')
        this.schools = schoolResponse.data?.data || schoolResponse.data || []
        
      } catch (error) {
        console.error('Error loading master data:', error)
      }
    },

    findMajorId(programName) {
      if (!programName) return null
      
      const major = this.majors.find(m => {
        // ค้นหาจาก title (รองรับทั้ง th และ en)
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
        // ค้นหาจาก title (รองรับทั้ง th และ en)
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

      // CInputFile ส่ง FileList มาตรงๆ
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
        // อ่านไฟล์ Excel
        const data = await this.readExcelFile(this.uploadedFile)

        if (!data || data.length === 0) {
          alert('No data found in the file')
          this.isProcessing = false
          return
        }
        // แปลงข้อมูลให้ตรงกับ schema
        const students = this.transformData(data)

        // บันทึกทีละคน
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
              row: studentIndex + 2, // +2 เพราะ row 1 เป็นหัวตาราง, array เริ่มที่ 0
              studentID: currentStudent.studentID,
              message: error.response?.data?.message || error.message
            })
            console.error(`Failed: ${currentStudent.studentID}`, error.message)
          }
        }
        // แสดงผลลัพธ์
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

        // Emit event เพื่อให้ parent component refresh ข้อมูล
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

            // อ่าน sheet แรก
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]

            // แปลงเป็น JSON
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

        // ดึง studentID จากหลายรูปแบบคอลัมภ์
        let studentID = row['ID']

        // ดึงชื่อภาษาไทยจากหลายรูปแบบ
        const nameThai = row['Name-Surname (Thai)']

        // ดึงชื่อภาษาอังกฤษ
        const nameEnglish = row.name_en || row.NameEN || row.name_english || 
          row.ชื่อภาษาอังกฤษ || row['Name-Surname (English)'] || ''

        // ดึง email หรือสร้างจาก studentID
        let email = `${studentID}@lamduan.mfu.ac.th`

        // ดึงข้อมูล Program/Major
        const programData = row['Programe']

        // ดึงข้อมูล School
        const schoolData = row['School'] 

        // แปลงชื่อเป็น ObjectId
        const majorId = this.findMajorId(programData)
        const schoolId = this.findSchoolId(schoolData)

        const student = {
          studentID: studentID ? String(studentID) : '',
          name: [
            {
              key: 'th',
              value: nameThai
            },
            {
              key: 'en',
              value: nameEnglish
            }
          ],
          email: email,
          info: {
            semester: row.semester || row.Semester || 1,
            major: majorId,  // ใช้ ObjectId แทน
            school: schoolId,  // ใช้ ObjectId แทน
            year: row.year || row.Year || row.ปีการศึกษา ? String(row.year || row.Year || row.ปีการศึกษา) : new Date().getFullYear().toString()
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