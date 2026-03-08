<template>
    <div>
        <CRow class="mb-4 align-items-center">
            <CCol md="8">
                <div class="custom-segmented-control">
                    <CButtonGroup class="w-100 h-100">
                        <CButton class="segment-btn font-weight-bold" :class="selected === 'Softskill' ? 'active' : ''"
                            @click="selected = 'Softskill'">
                            Softskill
                        </CButton>
                        <CButton class="segment-btn font-weight-bold" :class="selected === 'Hardskill' ? 'active' : ''"
                            @click="selected = 'Hardskill'">
                            Hardskill
                        </CButton>
                        <CButton class="segment-btn font-weight-bold"
                            :class="selected === 'Suggestions' ? 'active' : ''" @click="selected = 'Suggestions'">
                            Suggestions
                        </CButton>
                    </CButtonGroup>
                </div>
            </CCol>
            <CCol md="4" class="d-flex justify-content-end">
                <CButton color="danger" class="font-weight-bold d-flex align-items-center"
                    style="border-radius: 6px; padding: 8px 16px;" @click="showCreateModal = true">
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
            <CCard class="table-card border-0 shadow-sm mt-4 mb-4">
                <CDataTable class="custom-table mb-0" :items="softskillItems" :fields="softskillFields"
                    :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePage">
                    <!-- Year -->
                    <template #year="{ item }">
                        <td class="text-center align-middle font-weight-bold" style="color: #1e293b;">
                            {{ item.year }}
                        </td>
                    </template>

                    <!-- Title -->
                    <template #title="{ item }">
                        <td class="text-center align-middle" style="color: #334155;">
                            {{ item.title }}
                        </td>
                    </template>

                    <!-- Active Status -->
                    <template #status="{ item }">
                        <td class="text-center align-middle">
                            <div v-if="item.status === 'Active'"
                                class="d-inline-flex align-items-center font-weight-bold"
                                style="color: #dc2626; cursor: pointer;" title="Click to deactivate"
                                @click="toggleStatus(item._id)">
                                <CIcon name="cil-check-circle" class="mr-1"
                                    style="color: #dc2626; width: 16px; height: 16px;" />
                                Active
                            </div>
                            <div v-else class="d-inline-flex align-items-center text-muted" style="cursor: pointer;"
                                title="Click to make active" @click="toggleStatus(item._id)">
                                <div class="mr-2"
                                    style="width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1;">
                                </div>
                                Inactive
                            </div>
                        </td>
                    </template>

                    <!-- Assessment Question -->
                    <template #assessmentQuestion="{ item }">
                        <td class="align-middle py-3" style="min-width: 340px;">
                            <div class="question-list">
                                <div v-for="(q, idx) in item.questions" :key="idx" class="question-item"
                                    :class="{ 'question-item--border': idx < item.questions.length - 1 }">
                                    <div class="question-category">
                                        {{ q.categoryTh }} &bull; {{ q.categoryEn }}
                                    </div>
                                    <div class="question-title">{{ q.th }}</div>
                                    <div class="question-subtitle">{{ q.en }}</div>
                                </div>
                            </div>
                        </td>
                    </template>

                    <!-- Actions -->
                    <template #actions="{ item }">
                        <td class="text-center align-middle">
                            <CButton class="btn-action-icon mr-2" title="Edit" @click="editItem(item)">
                                <CIcon name="cil-pencil" />
                            </CButton>
                            <CButton class="btn-action-icon" title="Delete" @click="deleteItem(item._id)">
                                <CIcon name="cil-trash" />
                            </CButton>
                        </td>
                    </template>

                    <!-- Pagination -->
                    <template #under-table>
                        <div class="d-flex justify-content-between align-items-center px-4 py-3"
                            style="border-top: 1px solid #f3f4f6;">
                            <div class="text-muted" style="font-size: 13px;">
                                Showing {{ tableStart }} to {{ tableEnd }} of {{ softskillItems.length }} results
                            </div>
                            <CPagination :activePage.sync="activePage" :pages="totalPages" :doubleArrows="false"
                                align="end" class="mb-0 custom-pagination" />
                        </div>
                    </template>
                </CDataTable>
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

        <!-- Create Softskill Modal -->
        <CModal 
            :centered="true" 
            :show.sync="showCreateModal" 
            :close-on-backdrop="true" 
            size="lg"
            @update:show="handleCreateModalClose"
        >
            <template #header>
                <div>
                    <h5 class="modal-title font-weight-bold mb-1" style="color: #111827;">Create New Soft Skill</h5>
                    <p class="mb-0 text-muted" style="font-size: 13px;">Add a new bilingual soft skill assessment
                        criteria.</p>
                </div>
                <CButtonClose @click="showCreateModal = false" class="text-black" />
            </template>

            <div class="px-3 py-3">
                <!-- Basic Information Section -->
                <div class="modal-section mb-4">
                    <div class="section-header mb-3">
                        <span class="section-bar"></span>
                        <span class="section-title">BASIC INFORMATION</span>
                    </div>
                    <CRow class="mb-3">
                        <CCol md="6">
                            <label class="modal-field-label">Thai Title <span class="text-danger">*</span></label>
                            <CInput v-model="form.titleTh" placeholder="e.g. การสื่อสาร" class="modal-input" />
                        </CCol>
                        <CCol md="6">
                            <label class="modal-field-label">English Title <span class="text-danger">*</span></label>
                            <CInput v-model="form.titleEn" placeholder="e.g. Communication" class="modal-input" />
                        </CCol>
                    </CRow>
                    <CRow>
                        <CCol md="6">
                            <label class="modal-field-label">Academic Year <span class="text-danger">*</span></label>
                            <CInput v-model="form.year" placeholder="e.g. 2026" class="modal-input" />
                        </CCol>
                    </CRow>
                </div>

                <!-- Assessment Questions Section -->
                <div class="modal-section">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                        <div class="section-header d-flex align-items-center">
                            <span class="section-bar"></span>
                            <span class="section-title">ASSESSMENT QUESTIONS</span>
                        </div>
                        <button type="button" class="btn btn-link d-flex align-items-center font-weight-bold p-0"
                            style="color: #dc2626; font-size: 14px; text-decoration: none;" @click="addQuestion">
                            <CIcon name="cil-plus" size="sm" class="mr-2" /> Add Question
                        </button>
                    </div>

                    <div v-if="form.questions.length === 0" class="text-center text-muted py-4"
                        style="border: 1px dashed #e2e8f0; border-radius: 8px; font-size: 14px;">
                        No questions yet. Click "Add Question" to begin.
                    </div>

                    <div v-for="(q, idx) in form.questions" :key="idx" class="question-card mb-3">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="question-number-badge">{{ idx + 1 }}</span>
                            <CButton size="sm" variant="ghost" color="secondary" class="p-0" style="line-height:1;"
                                @click="removeQuestion(idx)" title="Remove">
                                <CIcon name="cil-x" size="sm" style="color:#94a3b8;" />
                            </CButton>
                        </div>
                        <CRow class="mb-3">
                            <CCol md="6">
                                <label class="modal-field-label-sm">VARIABLE (THAI)</label>
                                <CInput v-model="q.categoryTh" placeholder="e.g. การฟังอย่างตั้งใจ"
                                    class="modal-input" />
                            </CCol>
                            <CCol md="6">
                                <label class="modal-field-label-sm">VARIABLE (ENGLISH)</label>
                                <CInput v-model="q.categoryEn" placeholder="e.g. Active Listening"
                                    class="modal-input" />
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol md="6">
                                <label class="modal-field-label-sm">QUESTION (THAI) <span
                                        class="text-danger">*</span></label>
                                <CInput v-model="q.th" placeholder="คำถามสำหรับประเมิน..." class="modal-input" />
                            </CCol>
                            <CCol md="6">
                                <label class="modal-field-label-sm">QUESTION (ENGLISH) <span
                                        class="text-danger">*</span></label>
                                <CInput v-model="q.en" placeholder="Assessment question..." class="modal-input" />
                            </CCol>
                        </CRow>
                    </div>
                </div>
            </div>

            <template #footer>
                <div class="w-100 d-flex justify-content-end px-3 py-2">
                    <CButton color="light" class="mr-3 font-weight-bold"
                        style="color: #374151; padding: 10px 24px; border-radius: 6px; border: 1px solid #e5e7eb;"
                        @click="showCreateModal = false">
                        Cancel
                    </CButton>
                    <CButton color="danger" class="font-weight-bold d-flex align-items-center"
                        style="padding: 10px 24px; border-radius: 6px;" @click="createSoftskill">
                        <CIcon name="cil-save" class="mr-2" /> Create Skill
                    </CButton>
                </div>
            </template>
        </CModal>
    </div>
</template>

<script>
export default {
    name: 'Competencies',
    data() {
        return {
            selected: 'Softskill',
            searchQuery: '',
            academicYears: ['2023', '2024', '2025'],
            selectionAcademicYear: '',
            activePage: 1,
            itemsPerPage: 5,
            // Modal state
            showCreateModal: false,
            form: {
                year: '',
                titleTh: '',
                titleEn: '',
                questions: [],
            },
            softskillFields: [
                { key: 'year', label: 'YEAR', _classes: 'text-center', _style: 'min-width: 100px' },
                { key: 'title', label: 'TITLE', _classes: 'text-center', _style: 'min-width: 200px' },
                { key: 'status', label: 'ACTIVE STATUS', _classes: 'text-center' },
                { key: 'assessmentQuestion', label: 'ASSESSMENT QUESTION', _classes: 'text-center', _style: 'min-width: 180px' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
            softskillItems: [
                {
                    _id: '1', year: '2568', title: 'Communication Skills', status: 'Active',
                    questions: [
                        { categoryTh: 'การรับฟัง', categoryEn: 'LISTENING', th: 'คุณรับฟังปัญหาของเพื่อนร่วมงานอย่างไร?', en: "How do you listen to your colleagues' problems?" },
                        { categoryTh: 'การแสดงออก', categoryEn: 'EXPRESSION', th: 'คุณแสดงความเห็นใจเมื่อผู้อื่นผิดหวังอย่างไร?', en: 'How do you show empathy when others are disappointed?' },
                    ],
                },
                {
                    _id: '2', year: '2568', title: 'Teamwork & Collaboration', status: 'Active',
                    questions: [
                        { categoryTh: 'การทำงานร่วม', categoryEn: 'COOPERATION', th: 'คุณประสานงานกับทีมอย่างไรเมื่อเกิดความขัดแย้ง?', en: 'How do you coordinate with your team during conflicts?' },
                    ],
                },
                {
                    _id: '3', year: '2567', title: 'Problem Solving', status: 'Inactive',
                    questions: [
                        { categoryTh: 'การวางแผน', categoryEn: 'PLANNING', th: 'คุณวางแผนการทำงานระยะยาวอย่างไร?', en: 'How do you plan for long-term tasks?' },
                        { categoryTh: 'การคาดการณ์', categoryEn: 'FORECASTING', th: 'คุณคาดการณ์ปัญหาที่อาจเกิดขึ้นล่วงหน้าได้อย่างไร?', en: 'How do you anticipate potential problems?' },
                    ],
                },
                {
                    _id: '4', year: '2567', title: 'Leadership', status: 'Active',
                    questions: [
                        { categoryTh: 'การตัดสินใจ', categoryEn: 'DECISION', th: 'คุณตัดสินใจอย่างไรเมื่อมีข้อมูลไม่ครบถ้วน?', en: 'How do you make decisions with incomplete information?' },
                        { categoryTh: 'การจูงใจ', categoryEn: 'MOTIVATION', th: 'คุณสร้างแรงจูงใจให้ทีมของคุณอย่างไร?', en: 'How do you motivate your team?' },
                        { categoryTh: 'การมอบหมาย', categoryEn: 'DELEGATION', th: 'คุณมอบหมายงานให้เหมาะสมกับความสามารถอย่างไร?', en: 'How do you delegate tasks based on skill sets?' },
                    ],
                },
                {
                    _id: '5', year: '2566', title: 'Adaptability', status: 'Inactive',
                    questions: [
                        { categoryTh: 'ความยืดหยุ่น', categoryEn: 'FLEXIBILITY', th: 'คุณปรับตัวกับการเปลี่ยนแปลงอย่างรวดเร็วอย่างไร?', en: 'How do you adapt quickly to unexpected changes?' },
                    ],
                },
                {
                    _id: '6', year: '2566', title: 'Time Management', status: 'Active',
                    questions: [
                        { categoryTh: 'การจัดลำดับ', categoryEn: 'PRIORITIZING', th: 'คุณจัดลำดับความสำคัญของงานอย่างไร?', en: 'How do you prioritize your tasks?' },
                        { categoryTh: 'การตรงเวลา', categoryEn: 'PUNCTUALITY', th: 'คุณมั่นใจได้อย่างไรว่างานเสร็จตรงเวลา?', en: 'How do you ensure tasks are completed on time?' },
                    ],
                },
            ],
        }
    },
    computed: {
        filteredSoftskillItems() {
            let source = this.softskillItems
            if (this.selectionAcademicYear) {
                source = source.filter(item => item.year === this.selectionAcademicYear)
            }
            if (this.searchQuery && this.searchQuery.trim() !== '') {
                const q = this.searchQuery.toLowerCase().trim()
                source = source.filter(item => item.title.toLowerCase().includes(q))
            }
            return source
        },
        totalPages() {
            return Math.ceil(this.softskillItems.length / this.itemsPerPage) || 1
        },
        tableStart() {
            if (this.softskillItems.length === 0) return 0
            return (this.activePage - 1) * this.itemsPerPage + 1
        },
        tableEnd() {
            const end = this.activePage * this.itemsPerPage
            return end > this.softskillItems.length ? this.softskillItems.length : end
        },
    },
    methods: {
        getStatusClass(status) {
            return status === 'Active' ? 'status-replied' : 'status-closed'
        },
        getStatusIcon(status) {
            return status === 'Active' ? 'cil-check-circle' : 'cil-x-circle'
        },
        toggleStatus(id) {
            const item = this.softskillItems.find(i => i._id === id)
            if (item) {
                item.status = item.status === 'Active' ? 'Inactive' : 'Active'
            }
            // TODO: dispatch update action to backend
        },
        addQuestion() {
            this.form.questions.push({ categoryTh: '', categoryEn: '', th: '', en: '' })
        },
        removeQuestion(idx) {
            this.form.questions.splice(idx, 1)
        },
        handleCreateModalClose(val) {
            if (!val) {
                this.form = { year: '', titleTh: '', titleEn: '', questions: [] }
            }
        },
        createSoftskill() {
            if (!this.form.year || !this.form.titleTh) return
            const newId = String(Date.now())
            this.softskillItems.push({
                _id: newId,
                year: this.form.year,
                title: this.form.titleEn || this.form.titleTh,
                status: 'Inactive',
                questions: this.form.questions.map(q => ({ ...q })),
            })
            // TODO: dispatch create action to backend
            this.showCreateModal = false
            this.form = { year: '', titleTh: '', titleEn: '', questions: [] }
        },
        editItem(item) {
            // TODO: open edit modal
            console.log('edit', item)
        },
        deleteItem(id) {
            // TODO: dispatch delete action
            console.log('delete', id)
        },
    },
}
</script>

<style scoped>
.custom-segmented-control {
    background-color: #f3f4f6;
    border-radius: 8px;
    padding: 4px;
    display: inline-block;
    width: 100%;
    max-width: 300px;
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
    flex: 1;
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

/* Assessment Question List */
.question-list {
    display: flex;
    flex-direction: column;
}

.question-item {
    padding: 10px 0;
}

.question-item--border {
    border-bottom: 1px solid #f1f5f9;
}

.question-category {
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.4px;
    text-transform: uppercase;
    margin-bottom: 3px;
}

.question-title {
    font-size: 14px;
    font-weight: 700;
    color: #1e293b;
    margin-bottom: 2px;
    line-height: 1.4;
}

.question-subtitle {
    font-size: 13px;
    color: #64748b;
    line-height: 1.35;
}

/* Modal Styles */
.section-header {
    display: flex;
    align-items: center;
    gap: 12px;
}

.section-bar {
    display: inline-block;
    width: 4px;
    height: 18px;
    background-color: #dc2626;
    border-radius: 2px;
    flex-shrink: 0;
}

.section-title {
    font-size: 12px;
    font-weight: 700;
    color: #374151;
    letter-spacing: 0.6px;
    text-transform: uppercase;
}

.modal-section {
    background: #ffffff;
    border: 1px solid #f1f5f9;
    border-radius: 10px;
    padding: 20px;
}

.modal-field-label {
    display: block;
    font-size: 14px;
    font-weight: 500;
    color: #374151;
    margin-bottom: 6px;
}

.modal-field-label-sm {
    display: block;
    font-size: 11px;
    font-weight: 700;
    color: #94a3b8;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    margin-bottom: 4px;
}

.modal-input .form-control {
    border-radius: 6px;
    border: 1px solid #e5e7eb;
    font-size: 14px;
    color: #1e293b;
    background-color: #ffffff;
    padding: 8px 12px;
    transition: border-color 0.15s;
}

.modal-input .form-control:focus {
    border-color: #dc2626;
    box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.08);
}

.question-card {
    border: 1px solid #e5e7eb;
    border-radius: 10px;
    padding: 16px;
    background: #ffffff;
}

.question-number-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    background-color: #f1f5f9;
    border-radius: 6px;
    font-size: 13px;
    font-weight: 700;
    color: #475569;
}
</style>
