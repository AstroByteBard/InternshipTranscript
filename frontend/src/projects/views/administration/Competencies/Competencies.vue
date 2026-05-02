<template>
  <div>
    <!-- Premium Header Card -->
    <CCard class="border-0 shadow-sm custom-card mb-4 overflow-hidden header-card-accent">
      <CCardBody class="p-4">
        <CRow class="align-items-center">
          <CCol md="8">
            <h3 class="font-weight-bold text-dark mb-1">Competencies Management</h3>
            <p class="text-muted mb-0">Manage and track all skills, suggestions, and evaluation criteria in one place.</p>
          </CCol>
          <CCol md="4" class="text-right d-none d-md-block">
            <div class="d-flex justify-content-end">
                <CButton color="primary" class="modern-action-btn shadow-sm px-4" @click="$router.push('/administrator/FillForm')">
                    <CIcon name="cil-magnifying-glass" class="mr-2"/> Preview Form
                </CButton>
            </div>
          </CCol>
        </CRow>
      </CCardBody>
    </CCard>

    <CTabs add-nav-classes="px-4 custom-tabs" :active-tab.sync="activeTab">
        <!-- HARDSKILLS TAB -->
        <CTab title="Hardskills">
            <CCard class="border-0 shadow-sm mt-3 overflow-hidden" style="border-radius: 20px;">
                <CCardBody class="p-0">
                    <!-- Widgets Summary -->
                    <div class="px-4 pt-4 pb-2">
                        <WidgetsCompetencyDetail 
                            :totalItems="h_items.length"
                            :activeItems="h_items.filter(i => i.active).length"
                            :inactiveItems="h_items.filter(i => !i.active).length"
                            :totalQuestions="h_items.reduce((sum, item) => sum + (item.config ? item.config.length : 0), 0)"
                            itemName="Hardskills"
                            questionName="Questions"
                            questionIcon="cil-task"
                            style="box-shadow: none !important; border: none !important; background: transparent !important;"
                        />
                    </div>

                    <!-- Filter Bar -->
                    <div class="px-4 py-3 border-top border-bottom modern-filter-bar bg-light">
                        <CRow class="align-items-center">
                            <CCol md="3">
                                <div class="search-input-wrapper">
                                    <CIcon name="cil-search" class="search-icon" />
                                    <input type="text" class="form-control modern-search-input" placeholder="Search Hardskills..." v-model="h_searchQuery" />
                                </div>
                            </CCol>
                            <CCol md="9">
                                <div class="d-flex justify-content-end align-items-center flex-wrap">
                                    <CSelect custom class="modern-select-filter mb-0 mr-2" style="width: 140px;" :options="h_yearOptions" :value.sync="h_selectionAcademicYear" />
                                    <CSelect custom class="modern-select-filter mb-0 mr-2" style="width: 160px;" :options="h_schoolOptions" :value.sync="h_selectionSchool" />
                                    <CSelect custom class="modern-select-filter mb-0 mr-3" style="width: 160px;" :options="h_majorOptions" :value.sync="h_selectionMajor" />
                                    
                                    <div class="d-flex border-left pl-3 ml-1">
                                        <CButton color="primary" class="modern-action-btn" @click="h_showModal = true; h_isEdit = false; h_resetForm()">
                                            <CIcon name="cil-plus" class="mr-1"/> Add New
                                        </CButton>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>
                    </div>

                    <!-- Table Section -->
                    <CDataTable 
                        class="custom-table mb-0" 
                        :items="h_filteredItems" 
                        :fields="h_fields" 
                        :items-per-page="itemsPerPage" 
                        :pagination="false" 
                        hover 
                        :activePage.sync="h_activePage"
                        :no-items-view="{ noItems: (!h_selectionSchool || !h_selectionMajor) ? 'Please select School and Major to view Hardskills' : 'No Hardskills found' }"
                    >
                        <template #under-table>
                            <div class="d-flex justify-content-between align-items-center px-4 py-3" style="border-top: 1px solid #f3f4f6;">
                                <div class="text-muted" style="font-size: 13px;">Showing {{ h_tableStart }} to {{ h_tableEnd }} of {{ h_filteredItems.length }} results</div>
                                <CPagination :activePage.sync="h_activePage" :pages="h_totalPages" :doubleArrows="false" align="end" class="mb-0 custom-pagination" />
                            </div>
                        </template>
                        <template #status="{ item }">
                            <td class="text-center align-middle">
                                <div class="status-pill" :class="item.active ? 'status-replied' : 'status-closed'" @click="toggleStatus(item._id, 'h')" style="cursor: pointer;">
                                    {{ item.active ? 'Active' : 'Inactive' }}
                                </div>
                            </td>
                        </template>
                        <template #major="{ item }">
                            <td class="align-middle">
                                <div class="font-weight-bold" style="color: #1e293b;">{{ item.program ? translate(item.program.school.title) : '-' }}</div>
                                <div class="text-muted small">{{ item.program ? translate(item.program.title) : '-' }}</div>
                            </td>
                        </template>
                        <template #title="{ item }">
                            <td class="align-middle">
                                <div class="font-weight-bold" style="color: #1e293b;">{{ translate(item.title) }}</div>
                                <div class="text-muted small mt-1" v-if="item.description">{{ translate(item.description) }}</div>
                            </td>
                        </template>
                        <template #assessmentQuestion="{ item }">
                            <td class="text-center align-middle">
                                <span class="badge badge-light border px-2 py-1">{{ item.config ? item.config.length : 0 }} Questions</span>
                            </td>
                        </template>
                        <template #actions="{ item }">
                            <td class="text-center align-middle">
                                <CDropdown placement="bottom-end" :caret="false" add-menu-classes="shadow border-0 rounded-lg py-1">
                                    <template #toggler>
                                        <CButton class="btn-action-icon">
                                            <CIcon name="cil-options" />
                                        </CButton>
                                    </template>
                                    <CDropdownItem class="px-3 py-2 text-dark font-weight-bold" @click="h_editItem(item)">
                                        Edit
                                    </CDropdownItem>
                                    <CDropdownItem class="px-3 py-2 text-dark" @click="h_deleteItem(item._id)">
                                        Delete
                                    </CDropdownItem>
                                </CDropdown>
                            </td>
                        </template>
                    </CDataTable>
                </CCardBody>
            </CCard>
        </CTab>

        <!-- SOFTSKILLS TAB -->
        <CTab title="Softskills">
            <CCard class="border-0 shadow-sm mt-3 overflow-hidden" style="border-radius: 20px;">
                <CCardBody class="p-0">
                    <div class="px-4 pt-4 pb-2">
                        <WidgetsCompetencyDetail 
                            :totalItems="s_items.length"
                            :activeItems="s_items.filter(i => i.active).length"
                            :inactiveItems="s_items.filter(i => !i.active).length"
                            :totalQuestions="s_items.reduce((sum, item) => sum + (item.config ? item.config.length : 0), 0)"
                            itemName="Softskills"
                            questionName="Questions"
                            questionIcon="cil-comment-bubble"
                            style="box-shadow: none !important; border: none !important; background: transparent !important;"
                        />
                    </div>
                    <div class="px-4 py-3 border-top border-bottom modern-filter-bar bg-light">
                        <CRow class="align-items-center">
                            <CCol md="3">
                                <div class="search-input-wrapper">
                                    <CIcon name="cil-search" class="search-icon" />
                                    <input type="text" class="form-control modern-search-input" placeholder="Search Softskills..." v-model="s_searchQuery" />
                                </div>
                            </CCol>
                            <CCol md="9">
                                <div class="d-flex justify-content-end align-items-center flex-wrap">
                                    <CSelect custom class="modern-select-filter mb-0 mr-3" style="width: 140px;" :options="s_yearOptions" :value.sync="s_selectionAcademicYear" />
                                    <div class="d-flex border-left pl-3 ml-1">
                                        <CButton color="primary" class="modern-action-btn" @click="s_showModal = true; s_isEdit = false; s_resetForm()">
                                            <CIcon name="cil-plus" class="mr-1"/> Add New
                                        </CButton>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>
                    </div>
                    <CDataTable class="custom-table mb-0" :items="s_filteredItems" :fields="s_fields" :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="s_activePage">
                        <template #under-table>
                            <div class="d-flex justify-content-between align-items-center px-4 py-3" style="border-top: 1px solid #f3f4f6;">
                                <div class="text-muted" style="font-size: 13px;">Showing {{ s_tableStart }} to {{ s_tableEnd }} of {{ s_filteredItems.length }} results</div>
                                <CPagination :activePage.sync="s_activePage" :pages="s_totalPages" :doubleArrows="false" align="end" class="mb-0 custom-pagination" />
                            </div>
                        </template>
                        <template #status="{ item }">
                            <td class="text-center align-middle">
                                <div class="status-pill" :class="item.active ? 'status-replied' : 'status-closed'" @click="toggleStatus(item._id, 's')" style="cursor: pointer;">
                                    {{ item.active ? 'Active' : 'Inactive' }}
                                </div>
                            </td>
                        </template>
                        <template #title="{ item }">
                            <td class="align-middle font-weight-bold" style="color: #1e293b;">
                                {{ translate(item.title) }}
                            </td>
                        </template>
                        <template #assessmentQuestion="{ item }">
                            <td class="text-center align-middle">
                                <span class="badge badge-light border px-2 py-1">{{ item.config ? item.config.length : 0 }} Questions</span>
                            </td>
                        </template>
                        <template #actions="{ item }">
                            <td class="text-center align-middle">
                                <CDropdown placement="bottom-end" :caret="false" add-menu-classes="shadow border-0 rounded-lg py-1">
                                    <template #toggler>
                                        <CButton class="btn-action-icon">
                                            <CIcon name="cil-options" />
                                        </CButton>
                                    </template>
                                    <CDropdownItem class="px-3 py-2 text-dark font-weight-bold" @click="s_editItem(item)">
                                        Edit
                                    </CDropdownItem>
                                    <CDropdownItem class="px-3 py-2 text-dark" @click="s_deleteItem(item._id)">
                                        Delete
                                    </CDropdownItem>
                                </CDropdown>
                            </td>
                        </template>
                    </CDataTable>
                </CCardBody>
            </CCard>
        </CTab>

        <!-- SUGGESTIONS TAB -->
        <CTab title="Suggestions">
            <CCard class="border-0 shadow-sm mt-3 overflow-hidden" style="border-radius: 20px;">
                <CCardBody class="p-0">
                    <div class="px-4 pt-4 pb-2">
                        <WidgetsCompetencyDetail 
                            :totalItems="g_items.length"
                            :activeItems="g_items.filter(i => i.active).length"
                            :inactiveItems="g_items.filter(i => !i.active).length"
                            :totalQuestions="g_items.reduce((sum, item) => sum + (item.config ? item.config.length : 0), 0)"
                            itemName="Categories"
                            questionName="Suggestions"
                            questionIcon="cil-chat-bubble"
                            style="box-shadow: none !important; border: none !important; background: transparent !important;"
                        />
                    </div>
                    <div class="px-4 py-3 border-top border-bottom modern-filter-bar bg-light">
                        <CRow class="align-items-center">
                            <CCol md="3">
                                <div class="search-input-wrapper">
                                    <CIcon name="cil-search" class="search-icon" />
                                    <input type="text" class="form-control modern-search-input" placeholder="Search Suggestions..." v-model="g_searchQuery" />
                                </div>
                            </CCol>
                            <CCol md="9">
                                <div class="d-flex justify-content-end align-items-center flex-wrap">
                                    <CSelect custom class="modern-select-filter mb-0 mr-3" style="width: 140px;" :options="g_yearOptions" :value.sync="g_selectionAcademicYear" />
                                    <div class="d-flex border-left pl-3 ml-1">
                                        <CButton color="primary" class="modern-action-btn" @click="g_showModal = true; g_isEdit = false; g_resetForm()">
                                            <CIcon name="cil-plus" class="mr-1"/> Add New
                                        </CButton>
                                    </div>
                                </div>
                            </CCol>
                        </CRow>
                    </div>
                    <CDataTable class="custom-table mb-0" :items="g_filteredItems" :fields="g_fields" :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="g_activePage">
                        <template #under-table>
                            <div class="d-flex justify-content-between align-items-center px-4 py-3" style="border-top: 1px solid #f3f4f6;">
                                <div class="text-muted" style="font-size: 13px;">Showing {{ g_tableStart }} to {{ g_tableEnd }} of {{ g_filteredItems.length }} results</div>
                                <CPagination :activePage.sync="g_activePage" :pages="g_totalPages" :doubleArrows="false" align="end" class="mb-0 custom-pagination" />
                            </div>
                        </template>
                        <template #status="{ item }">
                            <td class="text-center align-middle">
                                <div class="status-pill" :class="item.active ? 'status-replied' : 'status-closed'" @click="toggleStatus(item._id, 'g')" style="cursor: pointer;">
                                    {{ item.active ? 'Active' : 'Inactive' }}
                                </div>
                            </td>
                        </template>
                        <template #title="{ item }">
                            <td class="align-middle font-weight-bold" style="color: #1e293b;">
                                {{ translate(item.title) }}
                            </td>
                        </template>
                        <template #suggestionContent="{ item }">
                            <td class="text-center align-middle">
                                <span class="badge badge-light border px-2 py-1">{{ item.config ? item.config.length : 0 }} Categories</span>
                            </td>
                        </template>
                        <template #actions="{ item }">
                            <td class="text-center align-middle">
                                <CDropdown placement="bottom-end" :caret="false" add-menu-classes="shadow border-0 rounded-lg py-1">
                                    <template #toggler>
                                        <CButton class="btn-action-icon">
                                            <CIcon name="cil-options" />
                                        </CButton>
                                    </template>
                                    <CDropdownItem class="px-3 py-2 text-dark font-weight-bold" @click="g_editItem(item)">
                                        Edit
                                    </CDropdownItem>
                                    <CDropdownItem class="px-3 py-2 text-dark" @click="g_deleteItem(item._id)">
                                        Delete
                                    </CDropdownItem>
                                </CDropdown>
                            </td>
                        </template>
                    </CDataTable>
                </CCardBody>
            </CCard>
        </CTab>
    </CTabs>

    <!-- MODALS -->
    <ModalHardskill :show.sync="h_showModal" :isEdit="h_isEdit" :form="h_form" :schoolOptions="h_schoolOptionsCreate" :majorOptions="h_majorOptionsCreate" @update:show="h_handleModalClose" @add-question="h_addQuestion" @remove-question="h_removeQuestion" @save="h_onSave" />
    <ModalSoftskill :show.sync="s_showModal" :isEdit="s_isEdit" :form="s_form" @update:show="s_handleModalClose" @add-question="s_addQuestion" @remove-question="s_removeQuestion" @save="s_onSave" />
    <ModalSuggestions :show.sync="g_showModal" :isEdit="g_isEdit" :form="g_form" @update:show="g_handleModalClose" @add-question="g_addQuestion" @remove-question="g_removeQuestion" @save="g_onSave" />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import WidgetsCompetencyDetail from '@/projects/components/widgets/WidgetsCompetencyDetail.vue'
import ModalHardskill from '@/projects/components/Modal/ModalHardskill.vue'
import ModalSoftskill from '@/projects/components/Modal/ModalSoftskill.vue'
import ModalSuggestions from '@/projects/components/Modal/ModalSuggestions.vue'
import * as XLSX from "xlsx"
import moment from "moment"

export default {
    name: 'Competencies',
    components: {
        WidgetsCompetencyDetail,
        ModalHardskill,
        ModalSoftskill,
        ModalSuggestions
    },
    data() {
        return {
            activeTab: 0,
            itemsPerPage: 5,
            schools: [],
            programs: [],

            // HARDSKILL STATE
            h_searchQuery: '',
            h_selectionAcademicYear: '',
            h_selectionSchool: '',
            h_selectionMajor: '',
            h_activePage: 1,
            h_showModal: false,
            h_isEdit: false,
            h_editingId: null,
            h_form: { year: '', titleTh: '', titleEn: '', descriptionTh: '', descriptionEn: '', school: '', major: '', questions: [] },
            h_fields: [
                { key: 'year', label: 'YEAR', _classes: 'text-center', _style: 'min-width: 80px' },
                { key: 'major', label: 'SCHOOL & PROGRAM', _classes: 'text-left', _style: 'min-width: 300px' },
                { key: 'title', label: 'COURSE / SUBJECT', _classes: 'text-left', _style: 'min-width: 200px' },
                { key: 'status', label: 'STATUS', _classes: 'text-center', _style: 'min-width: 120px' },
                { key: 'assessmentQuestion', label: 'QUESTIONS', _classes: 'text-center', _style: 'min-width: 150px' },
                { key: 'actions', label: '', _classes: 'text-center', _style: 'width: 80px', sorter: false, filter: false },
            ],

            // SOFTSKILL STATE
            s_searchQuery: '',
            s_selectionAcademicYear: '',
            s_activePage: 1,
            s_showModal: false,
            s_isEdit: false,
            s_editingId: null,
            s_form: { year: '', titleTh: '', titleEn: '', descriptionTh: '', descriptionEn: '', questions: [] },
            s_fields: [
                { key: 'year', label: 'YEAR', _classes: 'text-center', _style: 'min-width: 80px' },
                { key: 'title', label: 'TITLE', _classes: 'text-left', _style: 'min-width: 300px' },
                { key: 'status', label: 'STATUS', _classes: 'text-center', _style: 'min-width: 120px' },
                { key: 'assessmentQuestion', label: 'QUESTIONS', _classes: 'text-center', _style: 'min-width: 150px' },
                { key: 'actions', label: '', _classes: 'text-center', _style: 'width: 80px', sorter: false, filter: false },
            ],

            // SUGGESTIONS STATE
            g_searchQuery: '',
            g_selectionAcademicYear: '',
            g_activePage: 1,
            g_showModal: false,
            g_isEdit: false,
            g_editingId: null,
            g_form: { year: '', titleTh: '', titleEn: '', descriptionTh: '', descriptionEn: '', questions: [] },
            g_fields: [
                { key: 'year', label: 'YEAR', _classes: 'text-center', _style: 'min-width: 80px' },
                { key: 'title', label: 'TITLE', _classes: 'text-left', _style: 'min-width: 300px' },
                { key: 'status', label: 'STATUS', _classes: 'text-center', _style: 'min-width: 120px' },
                { key: 'suggestionContent', label: 'CATEGORIES', _classes: 'text-center', _style: 'min-width: 150px' },
                { key: 'actions', label: '', _classes: 'text-center', _style: 'width: 80px', sorter: false, filter: false },
            ],
        }
    },
    created() {
        this.fetchHardskills(); this.fetchSoftskills(); this.fetchSuggestions();
        this.fetchSchools(); this.fetchPrograms();
    },
    computed: {
        ...mapState('competencies/specific', ['specific']),
        ...mapState('competencies/general', ['general']),
        ...mapState('competencies/proposition', ['proposition']),
        
        translate() {
            return (data, key = 'th') => {
                if (!data || !Array.isArray(data)) return data
                const found = data.find(i => i.key === key)
                return found ? found.value : (data[0] ? data[0].value : '')
            }
        },

        // HARDSKILL
        h_items() { return this.specific || [] },
        h_yearOptions() {
            const years = this.h_items.map(item => item.year).filter(y => y && y !== '')
            const unique = [...new Set(years)].sort((a, b) => b.localeCompare(a))
            return [{ value: '', label: 'All Years' }, ...unique.map(y => ({ value: y, label: y }))]
        },
        h_schoolOptions() { return [{ value: '', label: 'All Schools' }, ...this.schools.map(s => ({ value: s._id, label: this.translate(s.title) }))] },
        h_schoolOptionsCreate() { return this.schools.map(s => ({ value: s._id, label: this.translate(s.title) })) },
        h_majorOptions() {
            let f = this.programs; if (this.h_selectionSchool) f = f.filter(p => p.school === this.h_selectionSchool);
            return [{ value: '', label: 'All Majors' }, ...f.map(p => ({ value: p._id, label: this.translate(p.title) }))]
        },
        h_majorOptionsCreate() {
            let f = this.programs; if (this.h_form.school) f = f.filter(p => p.school === this.h_form.school);
            return f.map(p => ({ value: p._id, label: this.translate(p.title) }))
        },
        h_filteredItems() {
            // Only show data if both school and major are selected
            if (!this.h_selectionSchool || !this.h_selectionMajor) return []

            let s = this.h_items
            if (this.h_selectionAcademicYear) s = s.filter(i => i.year === this.h_selectionAcademicYear)
            s = s.filter(i => i.program && i.program.school && i.program.school._id === this.h_selectionSchool)
            s = s.filter(i => i.program && i.program._id === this.h_selectionMajor)
            
            if (this.h_searchQuery) { 
                const q = this.h_searchQuery.toLowerCase().trim()
                s = s.filter(i => this.translate(i.title).toLowerCase().includes(q))
            }
            return s
        },
        h_totalPages() { return Math.ceil(this.h_filteredItems.length / this.itemsPerPage) || 1 },
        h_tableStart() { return this.h_filteredItems.length === 0 ? 0 : (this.h_activePage - 1) * this.itemsPerPage + 1 },
        h_tableEnd() { const end = this.h_activePage * this.itemsPerPage; return end > this.h_filteredItems.length ? this.h_filteredItems.length : end },

        // SOFTSKILL
        s_items() { return this.general || [] },
        s_yearOptions() {
            const years = this.s_items.map(item => item.year).filter(y => y && y !== '')
            const unique = [...new Set(years)].sort((a, b) => b.localeCompare(a))
            return [{ value: '', label: 'All Years' }, ...unique.map(y => ({ value: y, label: y }))]
        },
        s_filteredItems() {
            let s = this.s_items; if (this.s_selectionAcademicYear) s = s.filter(i => i.year === this.s_selectionAcademicYear);
            if (this.s_searchQuery) { const q = this.s_searchQuery.toLowerCase().trim(); s = s.filter(i => this.translate(i.title).toLowerCase().includes(q)); }
            return s
        },
        s_totalPages() { return Math.ceil(this.s_filteredItems.length / this.itemsPerPage) || 1 },
        s_tableStart() { return this.s_filteredItems.length === 0 ? 0 : (this.s_activePage - 1) * this.itemsPerPage + 1 },
        s_tableEnd() { const end = this.s_activePage * this.itemsPerPage; return end > this.s_filteredItems.length ? this.s_filteredItems.length : end },

        // SUGGESTIONS
        g_items() { return this.proposition || [] },
        g_yearOptions() {
            const years = this.g_items.map(item => item.year).filter(y => y && y !== '')
            const unique = [...new Set(years)].sort((a, b) => b.localeCompare(a))
            return [{ value: '', label: 'All Years' }, ...unique.map(y => ({ value: y, label: y }))]
        },
        g_filteredItems() {
            let s = this.g_items; if (this.g_selectionAcademicYear) s = s.filter(i => i.year === this.g_selectionAcademicYear);
            if (this.g_searchQuery) {
                const q = this.g_searchQuery.toLowerCase().trim()
                s = s.filter(i => JSON.stringify(i.title).toLowerCase().includes(q) || (i.config && JSON.stringify(i.config).toLowerCase().includes(q)))
            }
            return s
        },
        g_totalPages() { return Math.ceil(this.g_filteredItems.length / this.itemsPerPage) || 1 },
        g_tableStart() { return this.g_filteredItems.length === 0 ? 0 : (this.g_activePage - 1) * this.itemsPerPage + 1 },
        g_tableEnd() { const end = this.g_activePage * this.itemsPerPage; return end > this.g_filteredItems.length ? this.g_filteredItems.length : end }
    },
    methods: {
        ...mapActions('competencies/specific', { fetchHardskills: 'specific', createHardskill: 'createSpecific', updateHardskill: 'updateSpecific', deleteHardskill: 'deleteSpecific' }),
        ...mapActions('competencies/general', { fetchSoftskills: 'general', createSoftskill: 'createGeneral', updateSoftskill: 'updateGeneral', deleteSoftskill: 'deleteGeneral' }),
        ...mapActions('competencies/proposition', { fetchSuggestions: 'proposition', createSuggestion: 'createProposition', updateSuggestion: 'updateProposition', deleteSuggestion: 'deleteProposition' }),
        
        async fetchSchools() { this.$store.dispatch('academic/schools/schools').then(() => { this.schools = this.$store.state.academic.schools.schools || [] }) },
        async fetchPrograms() { this.$store.dispatch('academic/programs/programs').then(() => { this.programs = this.$store.state.academic.programs.programs || [] }) },

        async toggleStatus(id, type) {
            try {
                let target, action;
                if (type === 'h') { target = this.h_items.find(i => i._id === id); action = this.updateHardskill; }
                else if (type === 's') { target = this.s_items.find(i => i._id === id); action = this.updateSoftskill; }
                else { target = this.g_items.find(i => i._id === id); action = this.updateSuggestion; }
                if(!target) return
                await action({ _id: id, active: !target.active })
                if (type === 'h') this.fetchHardskills(); else if (type === 's') this.fetchSoftskills(); else this.fetchSuggestions();
            } catch(e) { console.error(e) }
        },

        // HARDSKILL
        h_resetForm() { this.h_form = { year: '', titleTh: '', titleEn: '', descriptionTh: '', descriptionEn: '', school: '', major: '', questions: [] } },
        h_handleModalClose(o) { if(!o) this.h_resetForm() },
        h_addQuestion() { this.h_form.questions.push({ categoryTh: '', categoryEn: '', th: '', en: '' }) },
        h_removeQuestion(i) { this.h_form.questions.splice(i, 1) },
        h_editItem(i) {
            this.h_isEdit = true; this.h_editingId = i._id;
            this.h_form = {
                year: i.year, titleTh: this.translate(i.title, 'th'), titleEn: this.translate(i.title, 'en'),
                descriptionTh: this.translate(i.description, 'th'), descriptionEn: this.translate(i.description, 'en'),
                school: i.program && i.program.school ? i.program.school._id : '', major: i.program ? i.program._id : '',
                questions: i.config.map(c => ({ categoryTh: this.translate(c.label, 'th'), categoryEn: this.translate(c.label, 'en'), th: this.translate(c.question, 'th'), en: this.translate(c.question, 'en') }))
            }; this.h_showModal = true
        },
        async h_deleteItem(id) { if(confirm('Delete?')) { await this.deleteHardskill(id); this.fetchHardskills() } },
        async h_onSave() {
            const p = { year: this.h_form.year, title: [{key:'th',value:this.h_form.titleTh},{key:'en',value:this.h_form.titleEn}], description: [{key:'th',value:this.h_form.descriptionTh},{key:'en',value:this.h_form.descriptionEn}], program: this.h_form.major, config: this.h_form.questions.map(q=>({label:[{key:'th',value:q.categoryTh},{key:'en',value:q.categoryEn}],question:[{key:'th',value:q.th},{key:'en',value:q.en}]})) };
            if(this.h_isEdit) { p._id = this.h_editingId; await this.updateHardskill(p); } else await this.createHardskill(p);
            this.h_showModal = false; this.fetchHardskills();
        },
        h_exportAssessment() { this.exportProcess(this.h_items, 'Hardskill') },

        // SOFTSKILL
        s_resetForm() { this.s_form = { year: '', titleTh: '', titleEn: '', descriptionTh: '', descriptionEn: '', questions: [] } },
        s_handleModalClose(o) { if(!o) this.s_resetForm() },
        s_addQuestion() { this.s_form.questions.push({ categoryTh: '', categoryEn: '', th: '', en: '' }) },
        s_removeQuestion(i) { this.s_form.questions.splice(i, 1) },
        s_editItem(i) {
            this.s_isEdit = true; this.s_editingId = i._id;
            this.s_form = {
                year: i.year, titleTh: this.translate(i.title, 'th'), titleEn: this.translate(i.title, 'en'),
                descriptionTh: this.translate(i.description, 'th'), descriptionEn: this.translate(i.description, 'en'),
                questions: i.config.map(c => ({ categoryTh: this.translate(c.label, 'th'), categoryEn: this.translate(c.label, 'en'), th: this.translate(c.question, 'th'), en: this.translate(c.question, 'en') }))
            }; this.s_showModal = true
        },
        async s_deleteItem(id) { if(confirm('Delete?')) { await this.deleteSoftskill(id); this.fetchSoftskills() } },
        async s_onSave() {
            const p = { year: this.s_form.year, title: [{key:'th',value:this.s_form.titleTh},{key:'en',value:this.s_form.titleEn}], description: [{key:'th',value:this.s_form.descriptionTh},{key:'en',value:this.s_form.descriptionEn}], config: this.s_form.questions.map(q=>({label:[{key:'th',value:q.categoryTh},{key:'en',value:q.categoryEn}],question:[{key:'th',value:q.th},{key:'en',value:q.en}]})) };
            if(this.s_isEdit) { p._id = this.s_editingId; await this.updateSoftskill(p); } else await this.createSoftskill(p);
            this.s_showModal = false; this.fetchSoftskills();
        },
        s_exportAssessment() { this.exportProcess(this.s_items, 'Softskill') },

        // SUGGESTIONS
        g_resetForm() { this.g_form = { year: '', titleTh: '', titleEn: '', descriptionTh: '', descriptionEn: '', questions: [] } },
        g_handleModalClose(o) { if(!o) this.g_resetForm() },
        g_addQuestion() { this.g_form.questions.push({ categoryTh: '', categoryEn: '', th: '', en: '' }) },
        g_removeQuestion(i) { this.g_form.questions.splice(i, 1) },
        g_editItem(i) {
            this.g_isEdit = true; this.g_editingId = i._id;
            this.g_form = {
                year: i.year, titleTh: this.translate(i.title, 'th'), titleEn: this.translate(i.title, 'en'),
                descriptionTh: i.description ? this.translate(i.description, 'th') : '', descriptionEn: i.description ? this.translate(i.description, 'en') : '',
                questions: (i.config || []).map(c => ({ categoryTh: this.translate(c.label, 'th'), categoryEn: this.translate(c.label, 'en'), th: this.translate(c.question, 'th'), en: this.translate(c.question, 'en') }))
            }; this.g_showModal = true
        },
        async g_deleteItem(id) { if(confirm('Delete?')) { await this.deleteSuggestion(id); this.fetchSuggestions() } },
        async g_onSave() {
            const p = { year: this.g_form.year, title: [{key:'th',value:this.g_form.titleTh},{key:'en',value:this.g_form.titleEn}], description: [{key:'th',value:this.g_form.descriptionTh},{key:'en',value:this.g_form.descriptionEn}], config: this.g_form.questions.map(q=>({label:[{key:'th',value:q.categoryTh},{key:'en',value:q.categoryEn}],question:[{key:'th',value:q.th},{key:'en',value:q.en}]})) };
            if(this.g_isEdit) { p._id = this.g_editingId; await this.updateSuggestion(p); } else await this.createSuggestion(p);
            this.g_showModal = false; this.fetchSuggestions();
        },
        g_exportAssessment() { this.exportProcess(this.g_items, 'Suggestion') },

        exportProcess(items, name) {
            if (!items.length) return
            const data = []
            items.forEach(item => {
                const titleTh = this.translate(item.title, 'th'); const titleEn = this.translate(item.title, 'en')
                if (item.config && item.config.length > 0) {
                    item.config.forEach((conf, idx) => {
                        data.push({ 'Academic Year': item.year, [name + ' Title (TH)']: titleTh, [name + ' Title (EN)']: titleEn, 'No.': idx + 1, 'Category (TH)': this.translate(conf.label, 'th'), 'Category (EN)': this.translate(conf.label, 'en'), 'Question (TH)': this.translate(conf.question, 'th'), 'Question (EN)': this.translate(conf.question, 'en') })
                    })
                }
            })
            if (!data.length) return
            const ws = XLSX.utils.json_to_sheet(data); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "Assessment")
            XLSX.writeFile(wb, `${name}_Assessment_${moment().format('YYYY-MM-DD')}.xlsx`)
        }
    }
}
</script>

<style scoped>
.header-card-accent { border-left: 6px solid #facc15 !important; }
.custom-card { border-radius: 16px; }
::v-deep .custom-tabs .nav-tabs { border-bottom: 2px solid #f1f5f9; padding-bottom: 0; }
::v-deep .custom-tabs .nav-link { color: #64748b; font-weight: 600; border: none; padding: 12px 24px; transition: all 0.2s; font-size: 14px; position: relative; }
::v-deep .custom-tabs .nav-link.active { color: #1e293b; background: transparent; }
::v-deep .custom-tabs .nav-link.active::after { content: ''; position: absolute; bottom: 0; left: 24px; right: 24px; height: 3px; background: #1e293b; border-radius: 3px 3px 0 0; }

.search-input-wrapper { position: relative; display: flex; align-items: center; }
.search-icon { position: absolute; left: 16px; color: #94a3b8; z-index: 10; font-size: 14px; }
.modern-search-input { background: #f8fafc !important; border: 1px solid #e2e8f0 !important; border-radius: 12px !important; padding: 10px 16px 10px 44px !important; height: 42px !important; font-size: 14px !important; transition: all 0.2s ease !important; width: 100%; }
.modern-search-input:focus { background: #ffffff !important; border-color: #facc15 !important; box-shadow: 0 0 0 4px rgba(250, 204, 21, 0.1) !important; outline: none; }

.modern-select-filter {
    height: 42px !important;
    font-size: 13px !important;
    color: #1e293b !important;
    font-weight: 500;
}
.modern-action-btn { height: 42px; border-radius: 10px; font-weight: 600; font-size: 13px; padding: 0 16px; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.modern-action-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

/* Table Styling */
.custom-table { border-collapse: separate; border-spacing: 0; }
::v-deep .custom-table thead th { background: #f8fafc; border-bottom: 1px solid #e2e8f0; color: #64748b; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; text-transform: uppercase; padding: 16px; border-top: none; }
::v-deep .custom-table tbody td { padding: 16px; border-bottom: 1px solid #f1f5f9; vertical-align: middle; }

/* Status Pills */
.status-pill { padding: 6px 12px; border-radius: 20px; font-size: 11px; font-weight: 700; display: inline-flex; align-items: center; text-transform: uppercase; letter-spacing: 0.5px; }
.status-replied { background: #ecfdf5; color: #059669; }
.status-closed { background: #f1f5f9; color: #64748b; }

.btn-action-icon { width: 32px; height: 32px; padding: 0; display: inline-flex; align-items: center; justify-content: center; border-radius: 8px; background: transparent; border: none; color: #94a3b8; transition: all 0.2s; }
.btn-action-icon:hover { background: #f1f5f9; color: #1e293b; }

::v-deep .custom-pagination .page-link { border: none; color: #64748b; font-weight: 600; font-size: 14px; margin: 0 2px; border-radius: 8px !important; width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; }
::v-deep .custom-pagination .page-item.active .page-link { background-color: #1e293b !important; color: white !important; }
</style>
