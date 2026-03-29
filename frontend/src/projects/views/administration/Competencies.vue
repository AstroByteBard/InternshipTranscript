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
                <CDataTable class="custom-table mb-0" :items="filteredSoftskillItems" :fields="softskillFields"
                    :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePage">
                    <!-- Year -->
                    <template #year="{ item }">
                        <div class="text-center font-weight-bold" style="color: #1e293b;">
                            {{ item.year || '-' }}
                        </div>
                    </template>

                    <!-- Title -->
                    <template #title="{ item }">
                        <div class="text-center" style="color: #334155;">
                            {{ translate(item.title) }}
                        </div>
                    </template>

                    <!-- Active Status -->
                    <template #status="{ item }">
                        <div class="text-center">
                            <div v-if="item.active"
                                class="d-inline-flex align-items-center font-weight-bold"
                                style="color: #dc2626; cursor: pointer;" title="Click to deactivate"
                                @click="toggleStatus(item._id, 'softskill')">
                                <CIcon name="cil-check-circle" class="mr-1"
                                    style="color: #dc2626; width: 16px; height: 16px;" />
                                Active
                            </div>
                            <div v-else class="d-inline-flex align-items-center text-muted" style="cursor: pointer;"
                                title="Click to make active" @click="toggleStatus(item._id, 'softskill')">
                                <div class="mr-2"
                                    style="width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1;">
                                </div>
                                Inactive
                            </div>
                        </div>
                    </template>

                    <!-- Assessment Question -->
                    <template #assessmentQuestion="{ item }">
                        <div class="align-middle py-3" style="min-width: 340px;">
                            <div class="question-list">
                                <div v-for="(c, idx) in item.config" :key="idx" class="question-item"
                                    :class="{ 'question-item--border': idx < item.config.length - 1 }">
                                    <div class="question-category">
                                        {{ translate(c.label, 'th') }} &bull; {{ translate(c.label, 'en') }}
                                    </div>
                                    <div class="question-title">{{ translate(c.question, 'th') }}</div>
                                    <div class="question-subtitle">{{ translate(c.question, 'en') }}</div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- Actions -->
                    <template #actions="{ item }">
                        <div class="text-center">
                            <CButton class="btn-action-icon mr-2" title="Edit" @click="editItem(item)">
                                <CIcon name="cil-pencil" />
                            </CButton>
                            <CButton class="btn-action-icon" title="Delete" @click="deleteItem(item._id, 'softskill')">
                                <CIcon name="cil-trash" />
                            </CButton>
                        </div>
                    </template>

                    <!-- Pagination -->
                    <template #under-table>
                        <div class="d-flex justify-content-between align-items-center px-4 py-3"
                            style="border-top: 1px solid #f3f4f6;">
                            <div class="text-muted" style="font-size: 13px;">
                                Showing {{ softskillTableStart }} to {{ softskillTableEnd }} of {{ filteredSoftskillItems.length }} results
                            </div>
                            <CPagination :activePage.sync="activePage" :pages="softskillTotalPages" :doubleArrows="false"
                                align="end" class="mb-0 custom-pagination" />
                        </div>
                    </template>
                </CDataTable>
            </CCard>
        </div>

        <div v-show="selected === 'Hardskill'">
            <CCard class="mb-4 filter-card shadow-sm border-0">
                <CCardBody class="p-3">
                    <CRow class="align-items-center mb-3">
                        <CCol md="4">
                            <div class="search-input-wrapper">
                                <CIcon name="cil-search" class="search-icon" />
                                <input type="text" class="form-control search-input"
                                    placeholder="Search by course or subject..." v-model="searchQueryHardskill" />
                            </div>
                        </CCol>
                        <CCol md="4">
                            <div class="d-flex align-items-center">
                                <label class="filter-label mr-2 mb-0" style="min-width: 60px;">SCHOOL: </label>
                                <CSelect class="custom-select-ui mb-0 w-100" :options="hardskillSchoolOptions"
                                    :value.sync="selectionSchoolHardskill" placeholder="All Schools" />
                            </div>
                        </CCol>
                        <CCol md="4">
                            <div class="d-flex align-items-center">
                                <label class="filter-label mr-2 mb-0" style="min-width: 60px;">MAJOR: </label>
                                <CSelect class="custom-select-ui mb-0 w-100" :options="hardskillMajorOptions"
                                    :value.sync="selectionMajorHardskill" placeholder="All Majors" />
                            </div>
                        </CCol>
                    </CRow>
                    <CRow class="align-items-center">
                        <CCol md="12" class="d-flex justify-content-end align-items-center">
                            <label class="filter-label mr-3 mb-0">ACADEMIC YEAR : </label>
                            <CSelect class="custom-select-ui mb-0" style="width: 200px;" :options="academicYears"
                                :value.sync="selectionAcademicYearHardskill" placeholder="All Years" />
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>
            <CCard class="table-card border-0 shadow-sm mt-4 mb-4">
                <CDataTable class="custom-table mb-0" :items="filteredHardskillItems" :fields="hardskillFields"
                    :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePageHardskill">
                    
                    <!-- Year -->
                    <template #year="{ item }">
                        <div class="text-center font-weight-bold" style="color: #1e293b;">
                            {{ item.year || '-' }}
                        </div>
                    </template>

                    <!-- School -->
                    <template #school="{ item }">
                        <div class="text-center" style="color: #475569;">
                            {{ item.program && item.program.school ? translate(item.program.school.title) : '-' }}
                        </div>
                    </template>

                    <!-- Major -->
                    <template #major="{ item }">
                        <div class="text-center" style="color: #475569;">
                            {{ item.program ? translate(item.program.title) : '-' }}
                        </div>
                    </template>

                    <!-- Title -->
                    <template #title="{ item }">
                        <div class="text-center" style="color: #334155;">
                            {{ translate(item.title) }}
                        </div>
                    </template>

                    <!-- Active Status -->
                    <template #status="{ item }">
                        <div class="text-center">
                            <div v-if="item.active"
                                class="d-inline-flex align-items-center font-weight-bold"
                                style="color: #dc2626; cursor: pointer;" title="Click to deactivate"
                                @click="toggleStatus(item._id, 'hardskill')">
                                <CIcon name="cil-check-circle" class="mr-1"
                                    style="color: #dc2626; width: 16px; height: 16px;" />
                                Active
                            </div>
                            <div v-else class="d-inline-flex align-items-center text-muted" style="cursor: pointer;"
                                title="Click to make active" @click="toggleStatus(item._id, 'hardskill')">
                                <div class="mr-2"
                                    style="width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1;">
                                </div>
                                Inactive
                            </div>
                        </div>
                    </template>

                    <!-- Assessment Question -->
                    <template #assessmentQuestion="{ item }">
                        <div class="align-middle py-3" style="min-width: 340px;">
                            <div class="question-list">
                                <div v-for="(c, idx) in item.config" :key="idx" class="question-item"
                                    :class="{ 'question-item--border': idx < item.config.length - 1 }">
                                    <div class="question-category">
                                        {{ translate(c.variable, 'th') }} &bull; {{ translate(c.variable, 'en') }}
                                    </div>
                                    <div class="question-title">{{ translate(c.question, 'th') }}</div>
                                    <div class="question-subtitle">{{ translate(c.question, 'en') }}</div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- Actions -->
                    <template #actions="{ item }">
                        <div class="text-center">
                            <CButton class="btn-action-icon mr-2" title="Edit" @click="editItem(item)">
                                <CIcon name="cil-pencil" />
                            </CButton>
                            <CButton class="btn-action-icon" title="Delete" @click="deleteItem(item._id, 'hardskill')">
                                <CIcon name="cil-trash" />
                            </CButton>
                        </div>
                    </template>

                    <!-- Pagination -->
                    <template #under-table>
                        <div class="d-flex justify-content-between align-items-center px-4 py-3"
                            style="border-top: 1px solid #f3f4f6;">
                            <div class="text-muted" style="font-size: 13px;">
                                Showing {{ hardskillTableStart }} to {{ hardskillTableEnd }} of {{ filteredHardskillItems.length }} results
                            </div>
                            <CPagination :activePage.sync="activePageHardskill" :pages="hardskillTotalPages" :doubleArrows="false"
                                align="end" class="mb-0 custom-pagination" />
                        </div>
                    </template>
                </CDataTable>
            </CCard>
        </div>

        <div v-show="selected === 'Suggestions'">
            <CCard class="mb-4 filter-card shadow-sm border-0">
                <CCardBody class="p-3">
                    <CRow class="align-items-center">
                        <CCol md="5">
                            <div class="search-input-wrapper">
                                <CIcon name="cil-search" class="search-icon" />
                                <input type="text" class="form-control search-input"
                                    placeholder="Search by category or content..." v-model="searchQuerySuggestions" />
                            </div>
                        </CCol>
                        <CCol md="7" class="d-flex justify-content-end align-items-center">
                            <label class="filter-label mr-3 mb-0">ACADEMIC YEAR : </label>
                            <CSelect class="custom-select-ui mb-0 mr-3" style="width: 200px;" :options="academicYears"
                                :value.sync="selectionAcademicYearSuggestions" placeholder="All Years" />
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>
            <CCard class="table-card border-0 shadow-sm mt-4 mb-4">
                <CDataTable class="custom-table mb-0" :items="filteredSuggestionItems" :fields="suggestionFields"
                    :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePageSuggestions">
                    
                    <!-- Year -->
                    <template #year="{ item }">
                        <div class="text-center font-weight-bold" style="color: #1e293b;">
                            {{ item.year || '-' }}
                        </div>
                    </template>

                    <!-- Title (formerly Category) -->
                    <template #title="{ item }">
                        <div class="text-center">
                            <CBadge color="info" shape="pill" class="px-3" style="font-size: 11px;">
                                {{ translate(item.title) || 'General' }}
                            </CBadge>
                        </div>
                    </template>

                    <!-- Suggestion Content -->
                    <template #suggestionContent="{ item }">
                        <div class="align-middle py-3" style="min-width: 340px;">
                            <div class="question-list">
                                <div v-for="(c, idx) in item.config" :key="idx" class="question-item"
                                    :class="{ 'question-item--border': idx < item.config.length - 1 }">
                                    <div class="question-title">{{ translate(c.question) }}</div>
                                </div>
                            </div>
                        </div>
                    </template>

                    <!-- Active Status -->
                    <template #status="{ item }">
                        <div class="text-center">
                            <div v-if="item.active"
                                class="d-inline-flex align-items-center font-weight-bold"
                                style="color: #dc2626; cursor: pointer;" title="Click to deactivate"
                                @click="toggleStatus(item._id, 'suggestions')">
                                <CIcon name="cil-check-circle" class="mr-1"
                                    style="color: #dc2626; width: 16px; height: 16px;" />
                                Active
                            </div>
                            <div v-else class="d-inline-flex align-items-center text-muted" style="cursor: pointer;"
                                title="Click to make active" @click="toggleStatus(item._id, 'suggestions')">
                                <div class="mr-2"
                                    style="width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1;">
                                </div>
                                Inactive
                            </div>
                        </div>
                    </template>

                    <!-- Actions -->
                    <template #actions="{ item }">
                        <div class="text-center">
                            <CButton class="btn-action-icon mr-2" title="Edit" @click="editItem(item)">
                                <CIcon name="cil-pencil" />
                            </CButton>
                            <CButton class="btn-action-icon" title="Delete" @click="deleteItem(item._id, 'suggestions')">
                                <CIcon name="cil-trash" />
                            </CButton>
                        </div>
                    </template>

                    <!-- Pagination -->
                    <template #under-table>
                        <div class="d-flex justify-content-between align-items-center px-4 py-3"
                            style="border-top: 1px solid #f3f4f6;">
                            <div class="text-muted" style="font-size: 13px;">
                                Showing {{ suggestionTableStart }} to {{ suggestionTableEnd }} of {{ filteredSuggestionItems.length }} results
                            </div>
                            <CPagination :activePage.sync="activePageSuggestions" :pages="suggestionTotalPages" :doubleArrows="false"
                                align="end" class="mb-0 custom-pagination" />
                        </div>
                    </template>
                </CDataTable>
            </CCard>
        </div>

        <!-- Create Modal -->
        <CModal 
            :centered="true" 
            :show.sync="showCreateModal" 
            :close-on-backdrop="true" 
            size="lg"
            @update:show="handleCreateModalClose"
        >
            <template #header>
                <div>
                    <h5 class="modal-title font-weight-bold mb-1" style="color: #111827;">{{ isEdit ? 'Edit' : 'Create New' }} {{ selected }}</h5>
                    <p class="mb-0 text-muted" style="font-size: 13px;">{{ isEdit ? 'Update' : 'Add a new bilingual' }} {{ selected.toLowerCase() }} assessment
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
                            <label class="modal-field-label">Thai {{ selected === 'Suggestions' ? 'Suggestion' : 'Title' }} <span class="text-danger">*</span></label>
                            <CInput v-model="form.titleTh" :placeholder="selected === 'Suggestions' ? 'e.g. ควรพัฒนาทักษะการสื่อสาร' : (selected === 'Hardskill' ? 'e.g. การพัฒนาเว็บ' : 'e.g. การสื่อสาร')" class="modal-input" />
                        </CCol>
                        <CCol md="6">
                            <label class="modal-field-label">English {{ selected === 'Suggestions' ? 'Suggestion' : 'Title' }} <span class="text-danger">*</span></label>
                            <CInput v-model="form.titleEn" :placeholder="selected === 'Suggestions' ? 'e.g. Should improve communication skills' : (selected === 'Hardskill' ? 'e.g. Web Development' : 'e.g. Communication')" class="modal-input" />
                        </CCol>
                    </CRow>
                    <CRow class="mb-3" v-if="selected !== 'Suggestions'">
                        <CCol md="6">
                            <label class="modal-field-label">Thai Description</label>
                            <CTextarea v-model="form.descriptionTh" placeholder="Description in Thai..." class="modal-input" rows="2" />
                        </CCol>
                        <CCol md="6">
                            <label class="modal-field-label">English Description</label>
                            <CTextarea v-model="form.descriptionEn" placeholder="Description in English..." class="modal-input" rows="2" />
                        </CCol>
                    </CRow>
                    <CRow class="mb-3" v-if="selected === 'Suggestions'">
                        <CCol md="6">
                            <label class="modal-field-label">Title / Category</label>
                            <CInput v-model="form.category" placeholder="e.g. Personality / Professionalism" class="modal-input" />
                        </CCol>
                    </CRow>
                    <CRow class="mb-3" v-if="selected === 'Hardskill'">
                        <CCol md="6">
                            <label class="modal-field-label">School</label>
                            <CSelect 
                                class="custom-select-ui mb-0 w-100 modal-input" 
                                :options="hardskillSchoolOptionsCreate"
                                :value.sync="form.school" 
                                placeholder="Select School" 
                            />
                        </CCol>
                        <CCol md="6">
                            <label class="modal-field-label">Major / Program</label>
                            <CSelect 
                                class="custom-select-ui mb-0 w-100 modal-input" 
                                :options="hardskillMajorOptionsCreate"
                                :value.sync="form.major" 
                                placeholder="Select Major" 
                            />
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
                            <span class="section-title">{{ selected === 'Suggestions' ? 'SUGGESTION ITEMS' : 'ASSESSMENT QUESTIONS' }}</span>
                        </div>
                        <button type="button" class="btn btn-link d-flex align-items-center font-weight-bold p-0"
                            style="color: #dc2626; font-size: 14px; text-decoration: none;" @click="addQuestion">
                            <CIcon name="cil-plus" size="sm" class="mr-2" /> Add {{ selected === 'Suggestions' ? 'Suggestion' : 'Question' }}
                        </button>
                    </div>

                    <div v-if="form.questions.length === 0" class="text-center text-muted py-4"
                        style="border: 1px dashed #e2e8f0; border-radius: 8px; font-size: 14px;">
                        No {{ selected === 'Suggestions' ? 'suggestions' : 'questions' }} yet. Click "Add {{ selected === 'Suggestions' ? 'Suggestion' : 'Question' }}" to begin.
                    </div>

                    <div v-for="(q, idx) in form.questions" :key="idx" class="question-card mb-3">
                        <div class="d-flex justify-content-between align-items-start mb-3">
                            <span class="question-number-badge">{{ idx + 1 }}</span>
                            <CButton size="sm" variant="ghost" color="secondary" class="p-0" style="line-height:1;"
                                @click="removeQuestion(idx)" title="Remove">
                                <CIcon name="cil-x" size="sm" style="color:#94a3b8;" />
                            </CButton>
                        </div>
                        <CRow class="mb-3" v-if="selected !== 'Suggestions'">
                            <CCol md="6">
                                <label class="modal-field-label-sm">VARIABLE (THAI)</label>
                                <CInput v-model="q.categoryTh" placeholder="e.g. การรับฟังอย่างตั้งใจ / Frontend"
                                    class="modal-input" />
                            </CCol>
                            <CCol md="6">
                                <label class="modal-field-label-sm">VARIABLE (ENGLISH)</label>
                                <CInput v-model="q.categoryEn" placeholder="e.g. Active Listening / Frontend"
                                    class="modal-input" />
                            </CCol>
                        </CRow>
                        <CRow>
                            <CCol md="6">
                                <label class="modal-field-label-sm">{{ selected === 'Suggestions' ? 'SUGGESTION' : 'QUESTION' }} (THAI) <span
                                        class="text-danger">*</span></label>
                                <CInput v-model="q.th" :placeholder="selected === 'Suggestions' ? 'คำแนะนำ...' : 'คำถามสำหรับประเมิน...'" class="modal-input" />
                            </CCol>
                            <CCol md="6">
                                <label class="modal-field-label-sm">{{ selected === 'Suggestions' ? 'SUGGESTION' : 'QUESTION' }} (ENGLISH) <span
                                        class="text-danger">*</span></label>
                                <CInput v-model="q.en" :placeholder="selected === 'Suggestions' ? 'Suggestion...' : 'Assessment question...'" class="modal-input" />
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
                        style="padding: 10px 24px; border-radius: 6px;" @click="onSave">
                        <CIcon name="cil-save" class="mr-2" /> {{ isEdit ? 'Update' : 'Create' }} {{ selected }}
                    </CButton>
                </div>
            </template>
        </CModal>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import Service from "../../../service/api";

export default {
    name: 'Competencies',
    data() {
        return {
            selected: 'Softskill',
            searchQuery: '',
            searchQueryHardskill: '',
            searchQuerySuggestions: '',
            academicYears: ['2023', '2024', '2025', '2566', '2567', '2568'],
            selectionAcademicYear: '',
            selectionAcademicYearHardskill: '',
            selectionAcademicYearSuggestions: '',
            selectionSchoolHardskill: '',
            selectionMajorHardskill: '',
            activePage: 1,
            activePageHardskill: 1,
            activePageSuggestions: 1,
            itemsPerPage: 5,
            schools: [],
            programs: [],
            // Modal state
            showCreateModal: false,
            isEdit: false,
            editingId: null,
            form: {
                year: '',
                titleTh: '',
                titleEn: '',
                school: '',
                major: '',
                category: '',
                questions: [],
            },
            softskillFields: [
                { key: 'year', label: 'YEAR', _classes: 'text-center', _style: 'min-width: 100px' },
                { key: 'title', label: 'TITLE', _classes: 'text-center', _style: 'min-width: 200px' },
                { key: 'status', label: 'ACTIVE STATUS', _classes: 'text-center' },
                { key: 'assessmentQuestion', label: 'ASSESSMENT QUESTION', _classes: 'text-center', _style: 'min-width: 180px' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
            hardskillFields: [
                { key: 'year', label: 'YEAR', _classes: 'text-center', _style: 'min-width: 100px' },
                { key: 'school', label: 'SCHOOL', _classes: 'text-center', _style: 'min-width: 150px' },
                { key: 'major', label: 'MAJOR / PROGRAM', _classes: 'text-center', _style: 'min-width: 150px' },
                { key: 'title', label: 'COURSE / SUBJECT', _classes: 'text-center', _style: 'min-width: 200px' },
                { key: 'status', label: 'ACTIVE STATUS', _classes: 'text-center' },
                { key: 'assessmentQuestion', label: 'ASSESSMENT QUESTION', _classes: 'text-center', _style: 'min-width: 180px' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
            suggestionFields: [
                { key: 'year', label: 'YEAR', _classes: 'text-center', _style: 'min-width: 100px' },
                { key: 'title', label: 'TITLE', _classes: 'text-center', _style: 'min-width: 150px' },
                { key: 'suggestionContent', label: 'SUGGESTION CONTENT', _classes: 'text-center', _style: 'min-width: 300px' },
                { key: 'status', label: 'ACTIVE STATUS', _classes: 'text-center' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
        }
    },
    created() {
        this.fetchSoftskills()
        this.fetchHardskills()
        this.fetchSuggestions()
        this.fetchMetadata()
    },
    computed: {
        ...mapState('competencies/general', ['general']),
        ...mapState('competencies/specific', ['specific']),
        ...mapState('competencies/proposition', ['proposition']),
        softskillItems() {
            return this.general || []
        },
        hardskillItems() {
            return this.specific || []
        },
        suggestionItems() {
            return this.proposition || []
        },
        translate() {
            return (data, key = 'th') => {
                if (!data || !Array.isArray(data)) return data
                const found = data.find(i => i.key === key)
                return found ? found.value : (data[0] ? data[0].value : '')
            }
        },
        hardskillSchoolOptions() {
            return this.schools.map(s => ({
                value: s._id,
                label: this.translate(s.title)
            }))
        },
        hardskillMajorOptions() {
            let filtered = this.programs
            if (this.selectionSchoolHardskill) {
                filtered = filtered.filter(p => p.school === this.selectionSchoolHardskill)
            }
            return filtered.map(p => ({
                value: p._id,
                label: this.translate(p.title)
            }))
        },
        hardskillSchoolOptionsCreate() {
            return this.schools.map(s => ({
                value: s._id,
                label: this.translate(s.title)
            }))
        },
        hardskillMajorOptionsCreate() {
            let filtered = this.programs
            if (this.form.school) {
                filtered = filtered.filter(p => p.school === this.form.school)
            }
            return filtered.map(p => ({
                value: p._id,
                label: this.translate(p.title)
            }))
        },
        // Softskill Computeds
        filteredSoftskillItems() {
            let source = this.softskillItems
            if (this.selectionAcademicYear) {
                source = source.filter(item => item.year === this.selectionAcademicYear)
            }
            if (this.searchQuery && this.searchQuery.trim() !== '') {
                const q = this.searchQuery.toLowerCase().trim()
                source = source.filter(item => {
                    const titleText = this.translate(item.title).toLowerCase()
                    return titleText.includes(q)
                })
            }
            return source
        },
        softskillTotalPages() {
            return Math.ceil(this.filteredSoftskillItems.length / this.itemsPerPage) || 1
        },
        softskillTableStart() {
            if (this.filteredSoftskillItems.length === 0) return 0
            return (this.activePage - 1) * this.itemsPerPage + 1
        },
        softskillTableEnd() {
            const end = this.activePage * this.itemsPerPage
            return end > this.filteredSoftskillItems.length ? this.filteredSoftskillItems.length : end
        },

        // Hardskill Computeds
        filteredHardskillItems() {
            let source = this.hardskillItems
            if (this.selectionAcademicYearHardskill) {
                source = source.filter(item => item.year === this.selectionAcademicYearHardskill)
            }
            if (this.selectionSchoolHardskill) {
                source = source.filter(item => item.program && item.program.school && item.program.school._id === this.selectionSchoolHardskill)
            }
            if (this.selectionMajorHardskill) {
                source = source.filter(item => item.program && item.program._id === this.selectionMajorHardskill)
            }
            if (this.searchQueryHardskill && this.searchQueryHardskill.trim() !== '') {
                const q = this.searchQueryHardskill.toLowerCase().trim()
                source = source.filter(item => {
                    const titleText = this.translate(item.title).toLowerCase()
                    return titleText.includes(q)
                })
            }
            return source
        },
        hardskillTotalPages() {
            return Math.ceil(this.filteredHardskillItems.length / this.itemsPerPage) || 1
        },
        hardskillTableStart() {
            if (this.filteredHardskillItems.length === 0) return 0
            return (this.activePageHardskill - 1) * this.itemsPerPage + 1
        },
        hardskillTableEnd() {
            const end = this.activePageHardskill * this.itemsPerPage
            return end > this.filteredHardskillItems.length ? this.filteredHardskillItems.length : end
        },

        // Suggestion Computeds
        filteredSuggestionItems() {
            let source = this.suggestionItems
            if (this.selectionAcademicYearSuggestions) {
                source = source.filter(item => item.year === this.selectionAcademicYearSuggestions)
            }
            if (this.searchQuerySuggestions && this.searchQuerySuggestions.trim() !== '') {
                const q = this.searchQuerySuggestions.toLowerCase().trim()
                source = source.filter(item => {
                    const titleText = this.translate(item.title).toLowerCase()
                    const configText = item.config ? JSON.stringify(item.config).toLowerCase() : ''
                    return titleText.includes(q) || configText.includes(q)
                })
            }
            return source
        },
        suggestionTotalPages() {
            return Math.ceil(this.filteredSuggestionItems.length / this.itemsPerPage) || 1
        },
        suggestionTableStart() {
            if (this.filteredSuggestionItems.length === 0) return 0
            return (this.activePageSuggestions - 1) * this.itemsPerPage + 1
        },
        suggestionTableEnd() {
            const end = this.activePageSuggestions * this.itemsPerPage
            return end > this.filteredSuggestionItems.length ? this.filteredSuggestionItems.length : end
        },
    },
    methods: {
        ...mapActions('competencies/general', {
            fetchSoftskills: 'general',
            createSoftskill: 'createGeneral',
            updateSoftskill: 'updateGeneral',
            deleteSoftskill: 'deleteGeneral'
        }),
        ...mapActions('competencies/specific', {
            fetchHardskills: 'specific',
            createHardskill: 'createSpecific',
            updateHardskill: 'updateSpecific',
            deleteHardskill: 'deleteSpecific'
        }),
        ...mapActions('competencies/proposition', {
            fetchSuggestions: 'proposition',
            createSuggestion: 'createProposition',
            updateSuggestion: 'updateProposition',
            deleteSuggestion: 'deleteProposition'
        }),
        getStatusClass(active) {
            return active ? 'status-replied' : 'status-closed'
        },
        getStatusIcon(active) {
            return active ? 'cil-check-circle' : 'cil-x-circle'
        },
        toggleStatus(id, type) {
            let items = []
            let updateAction = null

            if (type === 'softskill') {
                items = this.softskillItems
                updateAction = this.updateSoftskill
            } else if (type === 'hardskill') {
                items = this.hardskillItems
                updateAction = this.updateHardskill
            } else if (type === 'suggestions') {
                items = this.suggestionItems
                updateAction = this.updateSuggestion
            }

            const item = items.find(i => i._id === id || i.id === id)
            if (item) {
                const updatedItem = {
                    ...item,
                    active: !item.active
                }
                updateAction(updatedItem)
            }
        },
        addQuestion() {
            this.form.questions.push({ categoryTh: '', categoryEn: '', th: '', en: '' })
        },
        removeQuestion(idx) {
            this.form.questions.splice(idx, 1)
        },
        handleCreateModalClose(val) {
            if (!val) {
                this.form = { 
                    year: '', 
                    titleTh: '', 
                    titleEn: '', 
                    descriptionTh: '',
                    descriptionEn: '',
                    school: '', 
                    major: '', 
                    category: '', 
                    questions: [] 
                }
                this.isEdit = false
                this.editingId = null
            }
        },
        fetchMetadata() {
            Service.school('get').then(res => this.schools = res.data.data)
            Service.program('get').then(res => this.programs = res.data.data)
        },
        onSave() {
            console.log('onSave triggered, isEdit:', this.isEdit, 'form:', this.form)
            if (this.isEdit) {
                this.updateItem()
            } else {
                this.createSkill()
            }
        },
        createSkill() {
            if (!this.form.year || (!this.form.titleTh && this.selected !== 'Suggestions')) {
                alert('Please fill in all required fields (Year and Title)')
                return
            }

            const payload = {
                year: this.form.year,
                title: [
                    { key: 'th', value: this.selected === 'Suggestions' ? this.form.category : this.form.titleTh },
                    { key: 'en', value: this.selected === 'Suggestions' ? this.form.category : this.form.titleEn }
                ],
                description: [
                    { key: 'th', value: this.form.descriptionTh },
                    { key: 'en', value: this.form.descriptionEn }
                ],
                active: false
            }

            if (this.selected === 'Softskill') {
                payload.config = this.form.questions.map(q => ({
                    label: [
                        { key: 'th', value: q.categoryTh },
                        { key: 'en', value: q.categoryEn }
                    ],
                    question: [
                        { key: 'th', value: q.th },
                        { key: 'en', value: q.en }
                    ]
                }))
                this.createSoftskill(payload)
            } else if (this.selected === 'Hardskill') {
                payload.program = this.form.major
                payload.config = this.form.questions.map(q => ({
                    variable: [
                        { key: 'th', value: q.categoryTh },
                        { key: 'en', value: q.categoryEn }
                    ],
                    question: [
                        { key: 'th', value: q.th },
                        { key: 'en', value: q.en }
                    ]
                }))
                this.createHardskill(payload)
            } else if (this.selected === 'Suggestions') {
                payload.config = this.form.questions.map(q => ({
                    question: [
                        { key: 'th', value: q.th },
                        { key: 'en', value: q.en }
                    ]
                }))
                this.createSuggestion(payload)
            }

            this.showCreateModal = false
        },
        updateItem() {
            console.log('updateItem starting,EditingID:', this.editingId)
            if (!this.form.year || (!this.form.titleTh && this.selected !== 'Suggestions')) {
                alert('Please fill in all required fields (Year and Title)')
                return
            }

            const payload = {
                _id: this.editingId,
                year: this.form.year,
                title: [
                    { key: 'th', value: this.selected === 'Suggestions' ? this.form.category : this.form.titleTh },
                    { key: 'en', value: this.selected === 'Suggestions' ? this.form.category : this.form.titleEn }
                ],
                description: [
                    { key: 'th', value: this.form.descriptionTh },
                    { key: 'en', value: this.form.descriptionEn }
                ],
                active: this.form.active || false
            }

            if (this.selected === 'Softskill') {
                payload.config = this.form.questions.map(q => ({
                    label: [
                        { key: 'th', value: q.categoryTh },
                        { key: 'en', value: q.categoryEn }
                    ],
                    question: [
                        { key: 'th', value: q.th },
                        { key: 'en', value: q.en }
                    ]
                }))
                this.updateSoftskill(payload)
            } else if (this.selected === 'Hardskill') {
                payload.program = this.form.major
                payload.config = this.form.questions.map(q => ({
                    variable: [
                        { key: 'th', value: q.categoryTh },
                        { key: 'en', value: q.categoryEn }
                    ],
                    question: [
                        { key: 'th', value: q.th },
                        { key: 'en', value: q.en }
                    ]
                }))
                this.updateHardskill(payload)
            } else if (this.selected === 'Suggestions') {
                payload.config = this.form.questions.map(q => ({
                    question: [
                        { key: 'th', value: q.th },
                        { key: 'en', value: q.en }
                    ]
                }))
                this.updateSuggestion(payload)
            }

            this.showCreateModal = false
        },
        editItem(item) {
            this.isEdit = true
            this.editingId = item._id || item.id

            // Handle multilingual or legacy string title
            const titleTh = this.translate(item.title, 'th')
            const titleEn = this.translate(item.title, 'en')

            this.form = {
                year: item.year || '',
                titleTh: titleTh,
                titleEn: titleEn,
                descriptionTh: this.translate(item.description, 'th'),
                descriptionEn: this.translate(item.description, 'en'),
                school: item.program && item.program.school ? (item.program.school._id || item.program.school) : '',
                major: item.program ? (item.program._id || item.program) : '',
                category: titleTh,
                active: item.active || false,
                questions: []
            }

            // Handle multilingual config or legacy questions array
            if (item.config && Array.isArray(item.config)) {
                this.form.questions = item.config.map(c => ({
                    categoryTh: this.translate(c.label || c.variable, 'th') || '',
                    categoryEn: this.translate(c.label || c.variable, 'en') || '',
                    th: this.translate(c.question, 'th') || '',
                    en: this.translate(c.question, 'en') || '',
                }))
            } else if (item.questions && Array.isArray(item.questions)) {
                this.form.questions = item.questions.map(q => ({
                    categoryTh: q.categoryTh || '',
                    categoryEn: q.categoryEn || '',
                    th: q.th || '',
                    en: q.en || '',
                }))
            }
            
            this.showCreateModal = true
        },
        deleteItem(id, type) {
            if (type === 'softskill') {
                if (confirm('Are you sure you want to delete this Softskill?')) {
                    this.deleteSoftskill({ _id: id })
                }
                return
            }
            if (type === 'hardskill') {
                if (confirm('Are you sure you want to delete this Hardskill?')) {
                    this.deleteHardskill({ _id: id })
                }
                return
            }
            if (type === 'suggestions') {
                if (confirm('Are you sure you want to delete this Suggestion?')) {
                    this.deleteSuggestion({ _id: id })
                }
                return
            }
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
