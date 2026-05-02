<template>
  <div>
    <!-- Page Header -->
    <CCard class="border-0 shadow-sm custom-card mb-4 overflow-hidden header-card-accent">
      <CCardBody class="p-4 d-flex justify-content-between align-items-center bg-white">
        <div class="flex-grow-1">
          <h2 class="font-weight-bold text-dark mb-1">Correspondence</h2>
          <div class="d-flex align-items-center">
            <span class="text-muted small font-weight-bold">
              {{ $i18n.locale === 'th' ? 'จัดการการส่งอีเมลและติดตามสถานะการสื่อสารกับนักศึกษาและอาจารย์ที่ปรึกษา' : 'Manage email communications and track correspondence status for students and advisers' }}
            </span>
          </div>
        </div>
      </CCardBody>
    </CCard>

    <!-- Content Area (Tabs: Student & Adviser) -->
    <div class="content-pannel mt-4">
        <StudentEmailSection ref="correspondenceSection" />
    </div>

    <ModalEmailPreview ref="modalPreview" />
  </div>
</template>

<script>
import StudentEmailSection from '@/projects/components/Correspondence/StudentEmailSection.vue'
import ModalEmailPreview from '@/projects/components/Modal/ModalEmailPreview.vue'

export default {
    name: 'Correspondence',
    components: {
        StudentEmailSection,
        ModalEmailPreview,
    }
}
</script>

<style scoped>
.header-card-accent {
    border-left: 6px solid #facc15 !important;
}

.custom-card {
    border-radius: 20px !important;
}
</style>
