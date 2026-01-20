<template>
  <div>
    <CModal 
      :show.sync="isVisible" 
      :centered="true" 
      size="lg" 
      color="primary"
    >
      <template #header>
        <h6 class="modal-title">
          <CIcon name="cil-file-add" /> Import Students
        </h6>
        <CButtonClose @click="close" class="text-white" />
      </template>

      <CRow>
        <CCol sm="12">
          <p class="mb-3">Please select a CSV or Excel file to import student data.</p>
          <CInputFile
            label="Select File"
            placeholder="Choose file..."
            @change="handleFileUpload"
            custom
          />
          <div v-if="uploadedFile" class="mt-2">
            <small class="text-success">
              <CIcon name="cil-check-circle"/> Selected: {{ uploadedFile.name }}
            </small>
          </div>
        </CCol>
      </CRow>

      <template #footer>
        <CButton @click="close" color="secondary">
          <CIcon name="cil-ban"/> Cancel
        </CButton>
        <CButton @click="onImport" color="success">
          <CIcon name="cil-check"/> Import
        </CButton>
      </template>
    </CModal>
  </div>
</template>

<script>
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
      uploadedFile: null
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
  methods: {
    handleFileUpload(event) {
     console.log('change payload:', x)
      const files = event.target.files || event.dataTransfer.files
      if (!files.length) return
      
      this.uploadedFile = files[0]
    },
    
    onImport() {
      if (!this.uploadedFile) {
        alert('Please select a file first')
        return
      }
      
      this.$emit('import', this.uploadedFile)
      this.uploadedFile = null
      this.close()
    },
    
    close() {
      this.uploadedFile = null
      this.$emit('update:show', false)
    }
  }
}
</script>