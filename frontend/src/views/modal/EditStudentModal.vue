<template>
  <CModal :show.sync="isVisible" :centered="true" size="lg" color="info">
    <template #header>
      <h6 class="modal-title">
        <CIcon name="cil-pencil" /> Edit Student
      </h6>
      <CButtonClose @click="close" class="text-white" />
    </template>

    <CForm v-if="student">
      <CRow>
        <CCol sm="6">
          <CInput label="Student ID" v-model="student.studentID" readonly />
        </CCol>
        <CCol sm="6">
          <CInput label="Email" v-model="student.email" />
        </CCol>
      </CRow>
      <CRow>
        <CCol sm="12">
          <CInput label="Name (Thai)" v-model="student.name_th" />
        </CCol>
      </CRow>
      <CRow>
        <CCol sm="12">
          <CInput label="Name (English)" v-model="student.name_en" />
        </CCol>
      </CRow>
      <CRow>
        <CCol sm="12">
          <CInput label="Academic Year" v-model="student.year" />
        </CCol>
      </CRow>
    </CForm>

    <template #footer>
      <CButton @click="close" color="secondary">
        <CIcon name="cil-ban" /> Cancel
      </CButton>
      <CButton @click="save" color="info">
        <CIcon name="cil-check" /> Save
      </CButton>
    </template>
  </CModal>
</template>

<script>
export default {
  name: 'EditStudentModal',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    student: {
      type: Object,
      default: null
    }
  },
  watch: {
    student: {
      immediate: true,
      handler(newVal) {
        // สร้างสำเนาของ student เพื่อแก้ไขใน modal
        this.localStudent = newVal ? { ...newVal } : null
      }
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
    close() {

      this.$emit('update:show', false)
    },
    save() {
      this.$emit('save', this.localStudent)
    }
  }
}
</script>