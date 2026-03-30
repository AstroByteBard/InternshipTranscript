<template>
    <div>
        <CompetenciesHeader @export-assessment="exportAssessment" />
        <!-- Navigation & Management Bar -->
        <CCard class="management-card border-0 mb-4 shadow-sm">
            <CCardBody class="p-3">
                <CRow class="align-items-center">
                    <!-- Segmented Control (Softskill/Hardskill/Suggestions) -->
                    <CCol lg="4" md="5" class="mb-3 mb-md-0">
                        <div class="custom-segmented-control w-100">
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

                    <!-- Search Bar -->
                    <CCol lg="4" md="7" class="mb-3 mb-md-0">
                        <div class="search-input-wrapper">
                            <CIcon name="cil-search" class="search-icon" />
                            <input type="text" class="form-control modern-search-input"
                                :placeholder="'Search ' + selected + '...'" v-model="currentSearchQuery" />
                        </div>
                    </CCol>

                    <!-- Actions -->
                    <CCol lg="4" md="12" class="d-flex justify-content-end align-items-center flex-wrap">
                        <CButton class="btn-modern-action btn-modern-filter mr-2" @click="showFilters = !showFilters">
                            <CIcon name="cil-filter" class="mr-2" /> Filters
                        </CButton>
                        <CButton color="danger" class="btn-modern-action btn-modern-red font-weight-bold" 
                            style="border-radius: 6px;" @click="showCreateModal = true">
                            <CIcon name="cil-plus" class="mr-2" /> Create {{ selected }}
                        </CButton>
                    </CCol>
                </CRow>

                <!-- Expanded Filters -->
                <transition name="slide">
                    <div v-show="showFilters" class="mt-3 pt-3 border-top">
                        <CRow>
                            <CCol :md="selected === 'Hardskill' ? '3' : '12'">
                                <label class="filter-mini-label">ACADEMIC YEAR</label>
                                <CSelect 
                                    custom 
                                    class="modern-select-filter mb-0" 
                                    :options="yearOptions"
                                    :value.sync="currentYearFilter" 
                                    placeholder="All Years" 
                                />
                            </CCol>
                            <template v-if="selected === 'Hardskill'">
                                <CCol md="4" class="mb-3 mb-md-0">
                                    <label class="filter-mini-label">SCHOOL</label>
                                    <CSelect 
                                        custom 
                                        class="modern-select-filter mb-0" 
                                        :options="hardskillSchoolOptions"
                                        :value.sync="selectionSchoolHardskill" 
                                        placeholder="All Schools" 
                                    />
                                </CCol>
                                <CCol md="5" class="mb-3 mb-md-0">
                                    <label class="filter-mini-label">MAJOR / PROGRAM</label>
                                    <CSelect 
                                        custom 
                                        class="modern-select-filter mb-0" 
                                        :options="hardskillMajorOptions"
                                        :value.sync="selectionMajorHardskill" 
                                        placeholder="All Majors" 
                                    />
                                </CCol>
                            </template>
                        </CRow>
                    </div>
                </transition>
            </CCardBody>
        </CCard>
        <div v-show="selected === 'Softskill'">
            <CCard class="table-card border-0 shadow-sm mt-4 mb-4">
                <CDataTable class="custom-table mb-0" :items="filteredSoftskillItems" :fields="softskillFields"
                    :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePage">
                    
                    <!-- Year -->
                    <template #year="{ item }">
                        <td class="text-center align-middle">
                            <div class="font-weight-bold" style="color: #1e293b;">
                                {{ item.year || '-' }}
                            </div>
                        </td>
                    </template>

                    <!-- Title -->
                    <template #title="{ item }">
                        <td class="text-center align-middle">
                            <div style="color: #334155;">
                                {{ translate(item.title) }}
                            </div>
                        </td>
                    </template>

                    <!-- Active Status -->
                    <template #status="{ item }">
                        <td class="text-center align-middle">
                            <div v-if="item.active"
                                class="status-pill status-replied d-inline-flex align-items-center font-weight-bold"
                                style="cursor: pointer;" title="Click to deactivate"
                                @click="toggleStatus(item._id, 'softskill')">
                                <CIcon name="cil-check-circle" class="mr-1" size="sm" />
                                Active
                            </div>
                            <div v-else class="status-pill status-closed d-inline-flex align-items-center text-muted" 
                                style="cursor: pointer;" title="Click to make active" 
                                @click="toggleStatus(item._id, 'softskill')">
                                <div class="mr-2"
                                    style="width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1;">
                                </div>
                                Inactive
                            </div>
                        </td>
                    </template>

                    <!-- Assessment Question -->
                    <template #assessmentQuestion="{ item }">
                        <td class="align-middle py-3">
                            <div class="question-list" style="min-width: 300px;">
                                <div v-for="(c, idx) in item.config" :key="idx" class="question-item"
                                    :class="{ 'question-item--border': idx < item.config.length - 1 }">
                                    <div class="question-category">
                                        {{ translate(c.label, 'th') }} &bull; {{ translate(c.label, 'en') }}
                                    </div>
                                    <div class="question-title">{{ translate(c.question, 'th') }}</div>
                                    <div class="question-subtitle">{{ translate(c.question, 'en') }}</div>
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
                            <CButton class="btn-action-icon" title="Delete" @click="deleteItem(item._id, 'softskill')">
                                <CIcon name="cil-trash" />
                            </CButton>
                        </td>
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
            <CCard class="table-card border-0 shadow-sm mt-4 mb-4">
                <CDataTable class="custom-table mb-0" :items="filteredHardskillItems" :fields="hardskillFields"
                    :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePageHardskill">
                    
                    <!-- Year -->
                    <template #year="{ item }">
                        <td class="text-center align-middle">
                            <div class="font-weight-bold" style="color: #1e293b;">
                                {{ item.year || '-' }}
                            </div>
                        </td>
                    </template>

                    <!-- School -->
                    <template #school="{ item }">
                        <td class="text-center align-middle">
                            <div style="color: #475569;">
                                {{ item.program && item.program.school ? translate(item.program.school.title) : '-' }}
                            </div>
                        </td>
                    </template>

                    <!-- Major -->
                    <template #major="{ item }">
                        <td class="text-center align-middle">
                            <div style="color: #475569;">
                                {{ item.program ? translate(item.program.title) : '-' }}
                            </div>
                        </td>
                    </template>

                    <!-- Title -->
                    <template #title="{ item }">
                        <td class="text-center align-middle">
                            <div style="color: #334155;">
                                {{ translate(item.title) }}
                            </div>
                        </td>
                    </template>

                    <!-- Active Status -->
                    <template #status="{ item }">
                        <td class="text-center align-middle">
                            <div v-if="item.active"
                                class="status-pill status-replied d-inline-flex align-items-center font-weight-bold"
                                style="cursor: pointer;" title="Click to deactivate"
                                @click="toggleStatus(item._id, 'hardskill')">
                                <CIcon name="cil-check-circle" class="mr-1" size="sm" />
                                Active
                            </div>
                            <div v-else class="status-pill status-closed d-inline-flex align-items-center text-muted" 
                                style="cursor: pointer;" title="Click to make active" 
                                @click="toggleStatus(item._id, 'hardskill')">
                                <div class="mr-2"
                                    style="width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1;">
                                </div>
                                Inactive
                            </div>
                        </td>
                    </template>

                    <!-- Assessment Question -->
                    <template #assessmentQuestion="{ item }">
                        <td class="align-middle py-3">
                            <div class="question-list" style="min-width: 300px;">
                                <div v-for="(c, idx) in item.config" :key="idx" class="question-item"
                                    :class="{ 'question-item--border': idx < item.config.length - 1 }">
                                    <div class="question-category">
                                        {{ translate(c.variable, 'th') }} &bull; {{ translate(c.variable, 'en') }}
                                    </div>
                                    <div class="question-title">{{ translate(c.question, 'th') }}</div>
                                    <div class="question-subtitle">{{ translate(c.question, 'en') }}</div>
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
                            <CButton class="btn-action-icon" title="Delete" @click="deleteItem(item._id, 'hardskill')">
                                <CIcon name="cil-trash" />
                            </CButton>
                        </td>
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
            <CCard class="table-card border-0 shadow-sm mt-4 mb-4">
                <CDataTable class="custom-table mb-0" :items="filteredSuggestionItems" :fields="suggestionFields"
                    :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePageSuggestions">
                    
                    <!-- Year -->
                    <template #year="{ item }">
                        <td class="text-center align-middle">
                            <div class="font-weight-bold" style="color: #1e293b;">
                                {{ item.year || '-' }}
                            </div>
                        </td>
                    </template>

                    <!-- Title (formerly Category) -->
                    <template #title="{ item }">
                        <td class="text-center align-middle">
                            <CBadge color="info" shape="pill" class="px-3" style="font-size: 11px;">
                                {{ translate(item.title) || 'General' }}
                            </CBadge>
                        </td>
                    </template>

                    <!-- Suggestion Content -->
                    <template #suggestionContent="{ item }">
                        <td class="align-middle py-3">
                            <div class="question-list" style="min-width: 300px;">
                                <div v-for="(c, idx) in item.config" :key="idx" class="question-item"
                                    :class="{ 'question-item--border': idx < item.config.length - 1 }">
                                    <div class="question-title">{{ translate(c.question) }}</div>
                                </div>
                            </div>
                        </td>
                    </template>

                    <!-- Active Status -->
                    <template #status="{ item }">
                        <td class="text-center align-middle">
                            <div v-if="item.active"
                                class="status-pill status-replied d-inline-flex align-items-center font-weight-bold"
                                style="cursor: pointer;" title="Click to deactivate"
                                @click="toggleStatus(item._id, 'suggestions')">
                                <CIcon name="cil-check-circle" class="mr-1" size="sm" />
                                Active
                            </div>
                            <div v-else class="status-pill status-closed d-inline-flex align-items-center text-muted" 
                                style="cursor: pointer;" title="Click to make active" 
                                @click="toggleStatus(item._id, 'suggestions')">
                                <div class="mr-2"
                                    style="width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1;">
                                </div>
                                Inactive
                            </div>
                        </td>
                    </template>

                    <!-- Actions -->
                    <template #actions="{ item }">
                        <td class="text-center align-middle">
                            <CButton class="btn-action-icon mr-2" title="Edit" @click="editItem(item)">
                                <CIcon name="cil-pencil" />
                            </CButton>
                            <CButton class="btn-action-icon" title="Delete" @click="deleteItem(item._id, 'suggestions')">
                                <CIcon name="cil-trash" />
                            </CButton>
                        </td>
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
import CompetenciesHeader from '@/projects/components/Layout/CompetenciesHeader.vue'
import WidgetsCompetencies from '@/projects/components/widgets/WidgetsCompetencies.vue'
import Service from "../../../service/api";

export default {
    name: 'Competencies',
    components: {
        CompetenciesHeader,
        WidgetsCompetencies,
    },
    data() {
        return {
            selected: 'Softskill',
            searchQuery: '',
            searchQueryHardskill: '',
            searchQuerySuggestions: '',
            selectionAcademicYear: '',
            selectionAcademicYearHardskill: '',
            selectionAcademicYearSuggestions: '',
            selectionSchoolHardskill: '',
            selectionMajorHardskill: '',
            showFilters: false,
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
        uniqueYearsCount() {
            const allItems = [...this.softskillItems, ...this.hardskillItems, ...this.suggestionItems]
            const years = allItems.map(i => i.year).filter(y => y)
            return new Set(years).size
        },
        hardskillMajorOptions() {
            let filtered = this.programs
            if (this.selectionSchoolHardskill) {
                filtered = filtered.filter(p => p.school === this.selectionSchoolHardskill)
            }
            return [
                { value: '', label: 'All Majors' },
                ...filtered.map(p => ({
                    value: p._id,
                    label: this.translate(p.title)
                }))
            ]
        },
        currentSearchQuery: {
            get() {
                if (this.selected === 'Softskill') return this.searchQuery
                if (this.selected === 'Hardskill') return this.searchQueryHardskill
                return this.searchQuerySuggestions
            },
            set(val) {
                if (this.selected === 'Softskill') this.searchQuery = val
                else if (this.selected === 'Hardskill') this.searchQueryHardskill = val
                else this.searchQuerySuggestions = val
            }
        },
        currentYearFilter: {
            get() {
                if (this.selected === 'Softskill') return this.selectionAcademicYear
                if (this.selected === 'Hardskill') return this.selectionAcademicYearHardskill
                return this.selectionAcademicYearSuggestions
            },
            set(val) {
                if (this.selected === 'Softskill') this.selectionAcademicYear = val
                else if (this.selected === 'Hardskill') this.selectionAcademicYearHardskill = val
                else this.selectionAcademicYearSuggestions = val
            }
        },
        yearOptions() {
            const current = new Date().getFullYear() + 543
            const years = [
                { value: '', label: 'All Years' },
                { value: (current - 1).toString(), label: (current - 1).toString() },
                { value: current.toString(), label: current.toString() },
                { value: (current + 1).toString(), label: (current + 1).toString() },
            ]
            return years
        },
        hardskillSchoolOptions() {
            return [
                { value: '', label: 'All Schools' },
                ...this.schools.map(s => ({
                    value: s._id,
                    label: this.translate(s.title)
                }))
            ]
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
        exportAssessment() {
            this.$router.push('/fill-form');
        },
    },
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

.custom-segmented-control {
    background: #f1f5f9;
    padding: 4px;
    border-radius: 12px;
    display: flex;
    height: 48px;
}

.segment-btn {
    border: none !important;
    background: transparent !important;
    color: #64748b !important;
    border-radius: 8px !important;
    font-size: 14px !important;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: none !important;
}

.segment-btn.active {
    background: #ffffff !important;
    color: #dc2626 !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05) !important;
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
    height: 48px !important;
    font-size: 14px !important;
    transition: all 0.2s ease !important;
    width: 100%;
}

.modern-search-input:focus {
    background: #ffffff !important;
    border-color: #dc2626 !important;
    box-shadow: 0 0 0 4px rgba(220, 38, 38, 0.1) !important;
}

.btn-modern-action {
    height: 48px;
    padding: 0 20px;
    border-radius: 12px;
    font-weight: 600;
    font-size: 14px;
    display: flex;
    align-items: center;
    transition: all 0.2s;
    border: 1px solid #e2e8f0;
    background: white;
    color: #475569;
}

.btn-modern-action:hover {
    background: #f8fafc;
    border-color: #cbd5e1;
    transform: translateY(-1px);
}

.btn-modern-red {
    background: #dc2626 !important;
    color: white !important;
    border: none !important;
}

.btn-modern-red:hover {
    background: #b91c1c !important;
    box-shadow: 0 4px 12px rgba(220, 38, 38, 0.2);
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

/* Status Pills */
.status-pill {
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    display: inline-flex;
    align-items: center;
}

.status-replied {
    background: #ecfdf5;
    color: #059669;
}

.status-closed {
    background: #f1f5f9;
    color: #64748b;
}

.btn-action-icon {
    width: 36px;
    height: 36px;
    padding: 0;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 10px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #64748b;
    transition: all 0.2s;
}

.btn-action-icon:hover {
    background: #f1f5f9;
    color: #dc2626;
    border-color: #dc2626;
}

.table-card {
    border-radius: 20px;
    overflow: hidden;
}

.custom-table thead th {
    background: #f8fafc;
    border-bottom: 2px solid #f1f5f9;
    color: #475569;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.5px;
    text-transform: uppercase;
    padding: 16px;
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
