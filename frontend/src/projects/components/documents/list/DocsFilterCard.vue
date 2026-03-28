<template>
  <CCard class="mb-4 filter-card">
    <CCardBody class="p-3">
      <CRow class="align-items-center mb-3">
        <CCol md="12">
          <div class="search-input-wrapper">
            <CIcon name="cil-search" class="search-icon" />
            <input type="text" class="form-control search-input" placeholder="Search Document..."
              v-model="q" @input="$emit('search', q)" />
          </div>
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
</template>

<script>
export default {
  name: 'DocsFilterCard',
  data() {
    return { q: '' }
  }
}
</script>

<style scoped></style>
