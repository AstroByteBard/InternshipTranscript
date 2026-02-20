<template>
    <div>
        <CRow class="mb-4">
            <CCol sm="6">
                <div class="custom-segmented-control">
                    <CButtonGroup class="w-100 h-100">
                        <CButton v-for="(value, key) in ['Document', 'Certificate']" :key="key"
                            class="segment-btn font-weight-bold" :class="{ 'active': value === selected }"
                            @click="selected = value">
                            {{ value }}
                        </CButton>
                    </CButtonGroup>
                </div>
            </CCol>
        </CRow>

        <div v-if="selected === 'Document'">
            <CRow>
                <CCol>
                    <CCard class="mb-4 filter-card">
                        <CCardBody class="p-3">
                            <CRow class="align-items-center mb-3">
                                <CCol md="8">
                                    <div class="search-input-wrapper">
                                        <CIcon name="cil-search" class="search-icon" />
                                        <input type="text" class="form-control search-input"
                                            placeholder="Search Document..." />
                                    </div>
                                </CCol>
                                <CCol md="4" class="d-flex justify-content-end align-items-center">
                                    <CButton class="btn-filter-action btn-filter-red">
                                        <CIcon name="cil-envelope-closed" class="mr-2" /> Compose New Document
                                    </CButton>
                                </CCol>
                            </CRow>
                        </CCardBody>
                    </CCard>

                    <CCard class="mb-4">
                        <div class="custom-tabs-wrapper">
                            <div class="custom-tab px-4" :class="{ 'active': subTab === 'useDocument' }"
                                @click="subTab = 'useDocument'">
                                Use Document Format
                            </div>
                            <div class="custom-tab px-4" :class="{ 'active': subTab === 'notUseDocument' }"
                                @click="subTab = 'notUseDocument'">
                                Not Use Document Format
                            </div>
                        </div>
                        <CCardBody v-if="subTab === 'useDocument'" class="p-0">
                            <CDataTable class="custom-table mb-0" :items="documentsData" :fields="documentFields"
                                :items-per-page="5" hover>
                                <template #nameContent="{ item }">
                                    <td class="align-middle px-4 py-3">
                                        <div class="d-flex align-items-center">
                                            <div class="mr-3 doc-icon-wrapper" :class="getIconClass(item.type)">
                                                <CIcon :name="getIconName(item.type)" class="doc-icon-svg" />
                                            </div>
                                            <div>
                                                <div class="font-weight-bold" style="color: #1f2937; font-size: 14px;">
                                                    {{ item.name }}</div>
                                                <div class="text-muted small">{{ item.type }} &bull; {{ item.downloads
                                                    }} downloads</div>
                                            </div>
                                        </div>
                                    </td>
                                </template>

                                <template #category="{ item }">
                                    <td class="align-middle">
                                        <CBadge class="custom-badge">{{ item.category }}</CBadge>
                                    </td>
                                </template>

                                <template #size="{ item }">
                                    <td class="align-middle text-muted" style="font-size: 13px; font-weight: 500;">
                                        {{ item.size }}
                                    </td>
                                </template>

                                <template #uploadedBy="{ item }">
                                    <td class="align-middle text-muted" style="font-size: 13px; font-weight: 500;">
                                        {{ item.uploadedBy }}
                                    </td>
                                </template>

                                <template #uploadDate="{ item }">
                                    <td class="align-middle text-muted" style="font-size: 13px; font-weight: 500;">
                                        {{ item.uploadDate }}
                                    </td>
                                </template>

                                <template #actions="{ item }">
                                    <td class="align-middle text-right px-4 py-3">
                                        <CButton class="btn-action-icon mr-1" title="Download">
                                            <CIcon name="cil-data-transfer-down" />
                                        </CButton>
                                        <CButton class="btn-action-icon" title="Options">
                                            <CIcon name="cil-options" />
                                        </CButton>
                                    </td>
                                </template>
                            </CDataTable>
                        </CCardBody>
                        <CCardBody v-if="subTab === 'notUseDocument'">
                            <p>Not Use Document Format Data Table Placeholder</p>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </div>

        <div v-if="selected === 'Certificate'">
            <CRow>
                <CCol>
                    <CCard class="mb-4">
                        <CCardHeader>
                            <h4 class="mb-0">Certificates</h4>
                        </CCardHeader>
                        <CCardBody>
                            <p>Certificate content goes here.</p>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </div>
    </div>
</template>

<script>
export default {
    name: 'DocumentsIndex',
    data() {
        return {
            selected: 'Document',
            subTab: 'useDocument',
            documentFields: [
                { key: 'nameContent', label: 'NAME' },
                { key: 'category', label: 'CATEGORY' },
                { key: 'size', label: 'SIZE' },
                { key: 'uploadedBy', label: 'UPLOADED BY' },
                { key: 'uploadDate', label: 'UPLOAD DATE' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-right pe-4', sorter: false, filter: false },
            ],
            documentsData: [
                { id: 1, name: 'Student Handbook 2023-2024.pdf', type: 'PDF', downloads: 1245, category: 'Policy', size: '2.4 MB', uploadedBy: 'Admin Office', uploadDate: '2023-08-15' },
                { id: 2, name: 'Academic Calendar 2024.pdf', type: 'PDF', downloads: 856, category: 'Policy', size: '1.1 MB', uploadedBy: 'Registrar', uploadDate: '2023-09-01' },
                { id: 3, name: 'Enrollment Form.docx', type: 'Word', downloads: 2300, category: 'Form', size: '45 KB', uploadedBy: 'Registrar', uploadDate: '2023-07-20' },
                { id: 4, name: 'Q3 Financial Report.xlsx', type: 'Excel', downloads: 12, category: 'Report', size: '850 KB', uploadedBy: 'Finance Dept', uploadDate: '2023-10-15' },
                { id: 5, name: 'BSCS Curriculum.pdf', type: 'PDF', downloads: 560, category: 'Curriculum', size: '3.2 MB', uploadedBy: 'Dean of Computing', uploadDate: '2022-05-10' },
            ]
        }
    },
    methods: {
        getIconClass(type) {
            if (type === 'PDF') return 'doc-icon-pdf';
            if (type === 'Word') return 'doc-icon-word';
            if (type === 'Excel') return 'doc-icon-excel';
            return 'doc-icon-default';
        },
        getIconName(type) {
            if (type === 'PDF') return 'cil-file';
            if (type === 'Word') return 'cil-description';
            if (type === 'Excel') return 'cil-spreadsheet';
            return 'cil-file';
        }
    }
}
</script>

<style scoped>
.custom-segmented-control {
    background-color: #f3f4f6;
    border-radius: 8px;
    padding: 4px;
    display: inline-block;
    width: 100%;
    max-width: 250px;
}

.segment-btn {
    background-color: transparent;
    color: #6b7280;
    border: none;
    padding: 7px 18px;
    font-size: 14px;
    border-radius: 6px;
    transition: all 0.2s ease-in-out;
    box-shadow: none;
}

.segment-btn:hover {
    color: #374151;
    background-color: transparent;
}

.segment-btn.active {
    background-color: #ffffff !important;
    color: #111827 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06) !important;
    border: none !important;
}

.segment-btn:focus,
.segment-btn.focus {
    box-shadow: none !important;
}

.filter-card {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    background-color: #ffffff;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    color: #9ca3af;
    width: 16px;
    height: 16px;
    pointer-events: none;
}

.search-input {
    padding-left: 36px;
    height: 38px;
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    background-color: #f9fafb;
    color: #4b5563;
    font-size: 14px;
}

.search-input:focus {
    background-color: #ffffff;
    border-color: #d1d5db;
    box-shadow: 0 0 0 2px rgba(229, 231, 235, 0.5);
}

.btn-filter-action {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    color: #4b5563;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    padding: 6px 16px;
    display: inline-flex;
    align-items: center;
}

.btn-filter-action:hover {
    background-color: #f9fafb;
    color: #111827;
}

.btn-filter-red {
    background-color: #dc2626;
    border-color: #dc2626;
    color: #ffffff;
}

.btn-filter-red:hover {
    background-color: #b91c1c;
    border-color: #b91c1c;
    color: #ffffff;
}

.custom-tabs-wrapper {
    display: flex;
    border-bottom: 2px solid #f3f4f6;
    background-color: #ffffff;
    border-top-left-radius: 8px;
    border-top-right-radius: 8px;
    padding-top: 12px;
}

.custom-tab {
    cursor: pointer;
    padding-bottom: 12px;
    font-size: 14px;
    font-weight: 500;
    color: #6b7280;
    border-bottom: 2px solid transparent;
    margin-bottom: -2px;
    transition: all 0.2s ease-in-out;
}

.custom-tab:hover {
    color: #4b5563;
}

.custom-tab.active {
    color: #dc2626;
    border-bottom: 2px solid #dc2626;
    font-weight: 600;
}

/* Data Table Overrides */
::v-deep .custom-table table {
    margin-bottom: 0;
}

::v-deep .custom-table thead th {
    background-color: #ffffff !important;
    color: #9ca3af !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #f3f4f6 !important;
    padding: 16px 24px !important;
    vertical-align: middle;
}

::v-deep .custom-table tbody td {
    color: #374151 !important;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #f3f4f6 !important;
    padding: 12px 24px !important;
    vertical-align: middle;
}

::v-deep .custom-table tbody tr:hover td {
    background-color: #f9fafb !important;
}

::v-deep .custom-table tbody tr:last-child td {
    border-bottom: none !important;
}

/* Badges and Icons */
.custom-badge {
    background-color: #f3f4f6;
    color: #4b5563;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 12px;
    font-size: 11px;
}

.doc-icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    border-radius: 8px;
}

.doc-icon-svg {
    width: 18px;
    height: 18px;
}

.doc-icon-pdf {
    background-color: #fef2f2;
    color: #dc2626;
}

.doc-icon-word {
    background-color: #eff6ff;
    color: #2563eb;
}

.doc-icon-excel {
    background-color: #f0fdf4;
    color: #16a34a;
}

.doc-icon-default {
    background-color: #f3f4f6;
    color: #6b7280;
}

/* Actions */
.btn-action-icon {
    background-color: transparent !important;
    border: none !important;
    color: #9ca3af !important;
    border-radius: 6px;
    padding: 6px 8px;
    transition: all 0.2s;
    box-shadow: none !important;
}

.btn-action-icon:hover {
    color: #4b5563 !important;
    background-color: #f3f4f6 !important;
}

.btn-action-icon:focus {
    box-shadow: none !important;
}
</style>
