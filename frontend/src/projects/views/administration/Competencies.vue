<template>
    <div>
        <CRow class="mb-4 align-items-center">
            <CCol md="8">
                <div class="custom-segmented-control">
                    <CButtonGroup class="w-100 h-100">
                        <CButton class="segment-btn font-weight-bold" :class="{ active: selected === 'Softskill' }"
                            @click="selected = 'Softskill'">
                            Softskill
                        </CButton>
                        <CButton class="segment-btn font-weight-bold" :class="{ active: selected === 'Hardskill' }"
                            @click="selected = 'Hardskill'">
                            Hardskill
                        </CButton>
                        <CButton class="segment-btn font-weight-bold" :class="{ active: selected === 'Suggestions' }"
                            @click="selected = 'Suggestions'">
                            Suggestions
                        </CButton>
                    </CButtonGroup>
                </div>
            </CCol>
            <CCol md="4" class="d-flex justify-content-end">
                <CButton color="danger" class="font-weight-bold d-flex align-items-center"
                    style="border-radius: 6px; padding: 8px 16px;">
                    <CIcon name="cil-plus" class="mr-2" /> Create {{ selected }}
                </CButton>
            </CCol>
        </CRow>

        <div v-show="selected === 'Softskill'">
            <CCard class="mb-4 filter-card shadow-sm border-0">
                <CCardBody class="p-3">
                    <CRow class="align-items-center">
                        <CCol md="5">
                            <div class="search-input-wrapper">
                                <CIcon name="cil-search" class="search-icon" />
                                <input type="text" class="form-control search-input"
                                    placeholder="Search by name, ID, or subject..." v-model="searchQuery" />
                            </div>
                        </CCol>
                        <CCol md="7" class="d-flex justify-content-end align-items-center">
                            <label class="filter-label mr-3 mb-0">ACADEMIC YEAR : </label>
                            <CSelect class="custom-select-ui mb-0 mr-3" style="width: 200px;" :options="academicYears"
                                :value.sync="selectionAcademicYear" placeholder="All Years" />
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>
            <CCard class="shadow-sm border-0 mt-4">
                <CCardBody>
                    <h5 class="text-muted mb-0">Softskill Content</h5>
                </CCardBody>
            </CCard>
        </div>

        <div v-show="selected === 'Hardskill'">
            <CCard class="shadow-sm border-0">
                <CCardBody>
                    <h5 class="text-muted mb-0">Hardskill Content</h5>
                </CCardBody>
            </CCard>
        </div>

        <div v-show="selected === 'Suggestions'">
            <CCard class="shadow-sm border-0">
                <CCardBody>
                    <h5 class="text-muted mb-0">Suggestions Content</h5>
                </CCardBody>
            </CCard>
        </div>
    </div>
</template>

<script>
export default {
    name: 'Competencies',
    data() {
        return {
            selected: 'Softskill',
            searchQuery: '',
            academicYears: ['2023', '2024', '2025'], // Example options; adjust as needed or fetch dynamically
            selectionAcademicYear: ''
        }
    }
}
</script>

<style scoped>
.custom-segmented-control {
    background-color: #f1f5f9;
    border-radius: 8px;
    padding: 4px;
    height: 48px;
    box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.05);
}

.segment-btn {
    border-radius: 6px !important;
    border: none;
    color: #64748b;
    background-color: transparent;
    transition: all 0.2s ease;
    flex: 1;
}

.segment-btn:hover {
    color: #334155;
    background-color: rgba(255, 255, 255, 0.5);
}

.segment-btn.active {
    background-color: white !important;
    color: #ef4444 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

/* Filter Card Styles */
.filter-card {
    border: none;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);
    background-color: #ffffff;
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
    width: 18px;
    height: 18px;
}

.search-input {
    padding-left: 44px;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    height: 42px;
    font-size: 14px;
    transition: all 0.2s;
    background-color: #f8fafc;
}

.search-input:focus {
    background-color: #ffffff;
    border-color: #94a3b8;
    box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.1);
}

.filter-label {
    font-size: 12px;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 0.5px;
    margin-bottom: 0px;
}

.custom-select-ui {
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    height: 42px;
    font-size: 14px;
    color: #334155;
    background-color: #ffffff;
}
</style>
