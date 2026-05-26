<template>
  <CCard class="mb-4 filter-card">
    <CCardBody class="p-3">
      <CRow class="align-items-end">
        <CCol md="8" class="mb-3 mb-md-0">
          <label class="filter-mini-label">{{ $t('search_by_name_id_subject') }}</label>
          <div class="search-input-wrapper">
            <CIcon name="cil-search" class="search-icon" />
            <input type="text" class="form-control search-input"
              :placeholder="$t('components.documents_list_docsfiltercard_vue_search_document')" :value="searchQuery"
              @input="$emit('update:searchQuery', $event.target.value)" />
          </div>
        </CCol>
        <CCol md="4" class="mb-3 mb-md-0">
          <label class="filter-mini-label">{{ $t('language_label') }}</label>
          <CSelect custom class="locale-select mb-0" :options="localeOptions" :value="selectedLocale"
            :placeholder="$t('all_languages_label')" @update:value="$emit('update:selectedLocale', $event)" />
        </CCol>
      </CRow>
    </CCardBody>
  </CCard>
</template>

<script>
export default {
  name: 'DocsFilterCard',
  props: {
    searchQuery: { type: String, default: '' },
    selectedLocale: { type: String, default: '' },
    localeOptions: { type: Array, default: () => [] }
  }
}
</script>

<style scoped>
.filter-card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid rgba(229, 231, 235, 0.85);
  box-shadow: 0 8px 32px rgba(31, 41, 55, 0.06);
}

.filter-mini-label {
  font-size: 10px;
  font-weight: 800;
  color: #94a3b8;
  letter-spacing: 1px;
  margin-bottom: 6px;
  display: block;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 16px;
  color: #94a3b8;
  z-index: 10;
}

.search-input {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  padding: 10px 16px 10px 44px !important;
  height: 42px !important;
  font-size: 14px !important;
  width: 100%;
}

.search-input:focus {
  background: #ffffff !important;
  border-color: #dc2626 !important;
  box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1) !important;
}

.locale-select {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  height: 42px !important;
  font-size: 14px !important;
  color: #1e293b !important;
}
</style>
