<template>
    <div>
        <CompetenciesHeader 
            :show-create="true" 
            create-label="Create Hardskill" 
            @create-click="showCreateModal = true"
            @export-assessment="exportAssessment" 
        />
        <WidgetsCompetencyDetail 
            :totalItems="hardskillItems.length"
            :activeItems="activeHardskillsCount"
            :inactiveItems="inactiveHardskillsCount"
            :totalQuestions="totalHardskillQuestions"
            itemName="Hardskills"
            questionName="Questions"
            questionIcon="cil-task"
        />
        <!-- Navigation & Management Bar -->
        <FilterHardskill 
            :searchQuery.sync="searchQueryHardskill"
            :selectionSchool.sync="selectionSchoolHardskill"
            :selectionMajor.sync="selectionMajorHardskill"
            :selectionAcademicYear.sync="selectionAcademicYearHardskill"
            :schoolOptions="hardskillSchoolOptions"
            :majorOptions="hardskillMajorOptions"
            :yearOptions="yearOptions"
        />
        
        <div>
        <TableHardskill 
            :items="filteredHardskillItems"
            :fields="hardskillFields"
            :itemsPerPage="itemsPerPage"
            :activePage.sync="activePageHardskill"
            :totalPages="hardskillTotalPages"
            :tableStart="hardskillTableStart"
            :tableEnd="hardskillTableEnd"
            :totalItems="filteredHardskillItems.length"
            :translate="translate"
            @toggle-status="toggleStatus"
            @edit="editItem"
            @delete="deleteItem"
        />
        </div>

        <!-- Create Modal -->
        <ModalHardskill 
            :show.sync="showCreateModal"
            :isEdit="isEdit"
            :form="form"
            :schoolOptions="hardskillSchoolOptionsCreate"
            :majorOptions="hardskillMajorOptionsCreate"
            @update:show="handleCreateModalClose"
            @add-question="addQuestion"
            @remove-question="removeQuestion"
            @save="onSave"
        />
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import CompetenciesHeader from '@/projects/components/Layout/CompetenciesHeader.vue'
import WidgetsCompetencyDetail from '@/projects/components/widgets/WidgetsCompetencyDetail.vue'

import FilterHardskill from '@/projects/components/Filter/FilterHardskill.vue'
import TableHardskill from '@/projects/components/Table/TableHardskill.vue'
import ModalHardskill from '@/projects/components/Modal/ModalHardskill.vue'
import * as XLSX from "xlsx"
import moment from "moment"

export default {
    name: 'Hardskill',
    components: {
        CompetenciesHeader,
        WidgetsCompetencyDetail,
        FilterHardskill,
        TableHardskill,
        ModalHardskill
    },
    data() {
        return {
            searchQueryHardskill: '',
            selectionAcademicYearHardskill: '',
            selectionSchoolHardskill: '',
            selectionMajorHardskill: '',
            activePageHardskill: 1,
            itemsPerPage: 5,
            showCreateModal: false,
            isEdit: false,
            editingId: null,
            form: {
                year: '',
                titleTh: '',
                titleEn: '',
                descriptionTh: '',
                descriptionEn: '',
                school: '',
                major: '',
                questions: [],
            },
            hardskillFields: [
                { key: 'year', label: 'YEAR', _classes: 'text-center', _style: 'min-width: 100px' },
                { key: 'major', label: 'SCHOOL & PROGRAM', _classes: 'text-left', _style: 'min-width: 200px' },
                { key: 'title', label: 'COURSE / SUBJECT', _classes: 'text-center', _style: 'min-width: 200px' },
                { key: 'status', label: 'ACTIVE STATUS', _classes: 'text-center' },
                { key: 'assessmentQuestion', label: 'ASSESSMENT QUESTION', _classes: 'text-center', _style: 'min-width: 180px' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
            schools: [],
            programs: [],
        }
    },
    created() {
        this.fetchHardskills()
        this.fetchSchools()
        this.fetchPrograms()
    },
    computed: {
        ...mapState('competencies/specific', ['specific']),
        hardskillItems() {
            return this.specific || []
        },
        activeHardskillsCount() {
            return this.hardskillItems.filter(i => i.active).length
        },
        inactiveHardskillsCount() {
            return this.hardskillItems.filter(i => !i.active).length
        },
        totalHardskillQuestions() {
            return this.hardskillItems.reduce((sum, item) => sum + (item.config ? item.config.length : 0), 0)
        },
        translate() {
            return (data, key = 'th') => {
                if (!data || !Array.isArray(data)) return data
                const found = data.find(i => i.key === key)
                return found ? found.value : (data[0] ? data[0].value : '')
            }
        },
        yearOptions() {
            const years = this.hardskillItems
                .map(item => item.year)
                .filter(year => year && year !== '')
            const uniqueYears = [...new Set(years)].sort((a, b) => b.localeCompare(a))
            
            return [
                { value: '', label: 'All Years' },
                ...uniqueYears.map(year => ({ value: year, label: year }))
            ]
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
    },
    methods: {
        ...mapActions('competencies/specific', {
            fetchHardskills: 'specific',
            createHardskill: 'createSpecific',
            updateHardskill: 'updateSpecific',
            deleteHardskill: 'deleteSpecific'
        }),
        // these maps are assumed, user relies on fetchSchools/fetchPrograms in created? 
        // wait, earlier it dispatched them or used service. In Competencies.vue, how did it fetch metadata?
        // Let's implement fetchSchools and fetchPrograms from store manually if mapActions is complex
        // In the original, it used fetchMetadata() logic which I need to copy over.
        async fetchSchools() {
            // It was probably dispatching or calling service
            this.$store.dispatch('academic/schools/schools').then(() => {
                this.schools = this.$store.state.academic.schools.schools || [];
            }).catch(e => console.error(e));
        },
        async fetchPrograms() {
             this.$store.dispatch('academic/programs/programs').then(() => {
                this.programs = this.$store.state.academic.programs.programs || [];
            }).catch(e => console.error(e));
        },
        exportAssessment() {
            // Placeholder
        },
        handleCreateModalClose(isOpen) {
            if (!isOpen) {
                this.resetForm()
            }
        },
        exportAssessment() {
            if (!this.hardskillItems.length) return

            const lang = 'th'
            const data = []

            this.hardskillItems.forEach(item => {
                const titleTh = this.translate(item.title, 'th')
                const titleEn = this.translate(item.title, 'en')
                const schoolTitle = item.program && item.program.school ? this.translate(item.program.school.title, 'th') : '-'
                const majorTitle = item.program ? this.translate(item.program.title, 'th') : '-'

                if (item.config && item.config.length > 0) {
                    item.config.forEach((conf, idx) => {
                        data.push({
                            'Academic Year': item.year,
                            'School': schoolTitle,
                            'Major / Program': majorTitle,
                            'Course Title (Thai)': titleTh,
                            'Course Title (English)': titleEn,
                            'No.': idx + 1,
                            'Variable (Thai)': this.translate(conf.label, 'th'),
                            'Variable (English)': this.translate(conf.label, 'en'),
                            'Assessment Question (Thai)': this.translate(conf.question, 'th'),
                            'Assessment Question (English)': this.translate(conf.question, 'en'),
                            'Score (1-5)': ''
                        })
                    })
                }
            })

            if (data.length === 0) return

            const worksheet = XLSX.utils.json_to_sheet(data)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Hardskill Assessment")

            const wscols = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length, 20) }))
            worksheet['!cols'] = wscols

            XLSX.writeFile(workbook, `Hardskill_Assessment_Form_${moment().format('YYYY-MM-DD')}.xlsx`)
        },
        handleCreateModalClose(isOpen) {
            if (!isOpen) {
                this.resetForm()
            }
        },
        resetForm() {
            this.isEdit = false
            this.editingId = null
            this.form = {
                year: '',
                titleTh: '',
                titleEn: '',
                descriptionTh: '',
                descriptionEn: '',
                school: '',
                major: '',
                questions: [],
            }
        },
        addQuestion() {
            this.form.questions.push({
                categoryTh: '',
                categoryEn: '',
                th: '',
                en: ''
            })
        },
        removeQuestion(index) {
            this.form.questions.splice(index, 1)
        },
        async toggleStatus(id, type) {
            try {
                let items = this.hardskillItems
                const target = items.find(i => i._id === id)
                if(!target) return
                
                await this.updateHardskill({ _id: id, active: !target.active })
                this.fetchHardskills()
            } catch(e) {
                console.error(e)
            }
        },
        editItem(item) {
            this.isEdit = true
            this.editingId = item._id
            this.form.year = item.year
            this.form.titleTh = this.translate(item.title, 'th')
            this.form.titleEn = this.translate(item.title, 'en')
            this.form.descriptionTh = this.translate(item.description, 'th')
            this.form.descriptionEn = this.translate(item.description, 'en')
            this.form.school = item.program && item.program.school ? item.program.school._id : ''
            this.form.major = item.program ? item.program._id : ''
            this.form.questions = item.config.map(c => ({
                categoryTh: this.translate(c.label, 'th'),
                categoryEn: this.translate(c.label, 'en'),
                th: this.translate(c.question, 'th'),
                en: this.translate(c.question, 'en')
            }))
            this.showCreateModal = true
        },
        async deleteItem(id) {
            if(confirm('Are you sure you want to delete this Hardskill?')) {
                await this.deleteHardskill(id)
                this.fetchHardskills()
            }
        },
        async onSave() {
            if(!this.form.titleTh || !this.form.titleEn || !this.form.year || !this.form.major) {
                alert('Please fill out all required basic information (*)')
                return
            }
            if(this.form.questions.some(q => !q.th || !q.en)) {
                alert('Please fill out all required question fields (*)')
                return
            }

            const payload = {
                year: this.form.year,
                title: [
                    { key: 'th', value: this.form.titleTh },
                    { key: 'en', value: this.form.titleEn }
                ],
                description: [
                    { key: 'th', value: this.form.descriptionTh },
                    { key: 'en', value: this.form.descriptionEn }
                ],
                program: this.form.major,
                config: this.form.questions.map(q => ({
                    label: [
                        { key: 'th', value: q.categoryTh },
                        { key: 'en', value: q.categoryEn }
                    ],
                    question: [
                        { key: 'th', value: q.th },
                        { key: 'en', value: q.en }
                    ]
                }))
            }

            if(this.isEdit) {
                payload._id = this.editingId
                await this.updateHardskill(payload)
            } else {
                await this.createHardskill(payload)
            }
            this.showCreateModal = false
            this.fetchHardskills()
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

