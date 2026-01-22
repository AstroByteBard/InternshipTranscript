<!-- DeleteStudentModal.vue -->
<template>
  <CModal :show.sync="isVisible" :centered="true" color="danger">
    <template #header>
      <h6 class="modal-title">
        <CIcon name="cil-warning" /> Confirm Delete
      </h6>
      <CButtonClose @click="close" class="text-white" />
    </template>

    <p v-if="student">
      Are you sure you want to delete <strong>{{ student.displayName }}</strong> 
      ({{ student.studentID }})?
    </p>

    <template #footer>
      <CButton @click="close" color="secondary">
        <CIcon name="cil-ban" /> Cancel
      </CButton>
      <CButton @click="handleConfirm" color="danger">
        <CIcon name="cil-trash" /> Delete
      </CButton>
    </template>
  </CModal>
</template>

<script>
export default {
  name: 'DeleteStudentModal',
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
    handleConfirm() {
      console.log('Delete confirmed in modal')
      this.$emit('confirm', this.student)
    }
  }
}
</script>