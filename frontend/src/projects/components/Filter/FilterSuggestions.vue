<template>
    <CCard class="management-card border-0 mb-4 shadow-sm">
        <CCardBody class="p-3">
            <CRow class="align-items-end">
                <!-- Search Bar -->
                <CCol lg="6" md="6" class="mb-3 mb-lg-0">
                    <label class="filter-mini-label">SEARCH</label>
                    <div class="search-input-wrapper">
                        <CIcon name="cil-search" class="search-icon" />
                        <input type="text" class="form-control modern-search-input"
                            placeholder="Search Suggestions..." 
                            :value="searchQuery"
                            @input="$emit('update:searchQuery', $event.target.value)" />
                    </div>
                </CCol>

                <!-- Academic Year Filter -->
                <CCol lg="6" md="6" class="mb-3 mb-lg-0">
                    <label class="filter-mini-label">ACADEMIC YEAR</label>
                    <CSelect 
                        custom 
                        class="modern-select-filter mb-0" 
                        :options="yearOptions"
                        :value="selectionAcademicYear"
                        @update:value="$emit('update:selectionAcademicYear', $event)"
                        placeholder="All Years" 
                    />
                </CCol>
            </CRow>
        </CCardBody>
    </CCard>
</template>

<script>
export default {
    name: 'SuggestionsFilter',
    props: {
        searchQuery: {
            type: String,
            default: ''
        },
        selectionAcademicYear: {
            type: String,
            default: ''
        },
        yearOptions: {
            type: Array,
            default: () => []
        }
    }
}
</script>

<style scoped>
.management-card {
    border-radius: 20px;
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.07);
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

.modern-search-input {
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 12px !important;
    padding: 10px 16px 10px 44px !important;
    height: 42px !important;
    font-size: 14px !important;
    transition: all 0.2s ease !important;
    width: 100%;
}

.modern-search-input:focus {
    background: #ffffff !important;
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1) !important;
}

.modern-select-filter {
    background: #f8fafc !important;
    border: 1px solid #e2e8f0 !important;
    border-radius: 10px !important;
    height: 42px !important;
    font-size: 13px !important;
    color: #1e293b !important;
}

.filter-mini-label {
    font-size: 10px;
    font-weight: 800;
    color: #94a3b8;
    letter-spacing: 1px;
    margin-bottom: 6px;
    display: block;
}
</style>
