<template>
  <CRow class="top-nav m-0 py-3 bg-white border-bottom shadow-sm mb-4 align-items-center">
    <CCol sm="4" class="d-flex align-items-center">
      <CButton size="sm" variant="ghost" class="btn-back mr-3" @click="$router.push('/documents')">
        <CIcon name="cil-chevron-left" />
      </CButton>
      <h5 class="mb-0 font-weight-bold">Compose Document</h5>
    </CCol>

    <CCol sm="8" class="d-flex align-items-center justify-content-end">

      <div class="custom-segmented-control mr-4">
        <CButtonGroup class="w-100">
          <CButton size="sm" class="segment-btn" :class="{ 'active': !isPreview, 'text-muted': isPreview }"
            @click="$emit('update:isPreview', false)">
            <CIcon name="cil-pencil" class="mr-2" size="sm" /> Write
          </CButton>
          <CButton size="sm" class="segment-btn" :class="{ 'active': isPreview, 'text-muted': !isPreview }"
            @click="$emit('update:isPreview', true)">
            <CIcon name="cil-eye" class="mr-2" size="sm" /> Preview
          </CButton>
          <CButton size="sm" class="segment-btn" :class="{ 'active': showSettings, 'text-muted': !showSettings }"
            @click="$emit('update:showSettings', !showSettings)">
            <CIcon name="cil-settings" class="mr-2" size="sm" /> Setting
          </CButton>
        </CButtonGroup>
      </div>

      <CButton size="sm" variant="ghost" class="text-muted font-weight-bold mr-3" @click="$emit('cancel')">
        Cancel
      </CButton>
      <CButton size="sm" color="danger" class="btn-save font-weight-bold text-white px-3" @click="$emit('save')">
        <CIcon name="cil-save" class="mr-2" /> Save Document
      </CButton>
    </CCol>
  </CRow>
</template>

<script>
export default {
  name: 'DocumentTopNav',
  props: {
    isPreview: { type: Boolean, default: false },
    showSettings: { type: Boolean, default: true }
  }
}
</script>

<style scoped>
.top-nav {
  padding-top: 0.5rem !important;
  padding-bottom: 0.5rem !important;
}

.segment-btn {
  font-size: 0.65rem !important;
  padding: 0.2rem 0.5rem !important;
  min-height: 24px;
  display: flex;
  align-items: center;
}

.custom-segmented-control {
  border: 1px solid #ebedef;
  border-radius: 0.25rem;
  padding: 1px;
  background-color: #f8f9fa;
}

.custom-segmented-control .btn {
  border: none !important;
  border-radius: 0.2rem !important;
  line-height: 1;
}

.custom-segmented-control .btn.active {
  background-color: white !important;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
  color: #3c4b64 !important;
}

.btn-save {
  font-size: 0.7rem !important;
  padding: 0.25rem 0.6rem !important;
}

.btn-back {
  padding: 0.2rem 0.4rem !important;
}

.top-nav h5 {
  font-size: 0.9rem !important;
  margin-left: -5px;
}
</style>
