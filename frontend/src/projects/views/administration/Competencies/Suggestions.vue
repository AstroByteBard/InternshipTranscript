<template>
    <div>
        <CompetenciesHeader 
            :show-create="true" 
            create-label="Create Suggestions" 
            @create-click="showCreateModal = true"
            @export-assessment="exportAssessment" 
        />
        <WidgetsCompetencyDetail 
            :totalItems="suggestionItems.length"
            :activeItems="activeSuggestionsCount"
            :inactiveItems="inactiveSuggestionsCount"
            :totalQuestions="totalSuggestionsCount"
            itemName="Categories"
            questionName="Suggestions"
            questionIcon="cil-chat-bubble"
        />
        <FilterSuggestions 
            :searchQuery.sync="searchQuerySuggestions"
            :selectionAcademicYear.sync="selectionAcademicYearSuggestions"
            :yearOptions="yearOptions"
        />
        
        <TableSuggestions 
            :items="filteredSuggestionItems"
            :fields="suggestionFields"
            :itemsPerPage="itemsPerPage"
            :activePage.sync="activePageSuggestions"
            :totalPages="suggestionTotalPages"
            :tableStart="suggestionTableStart"
            :tableEnd="suggestionTableEnd"
            :totalItems="filteredSuggestionItems.length"
            :translate="translate"
            @toggle-status="toggleStatus"
            @edit="editItem"
            @delete="deleteItem"
        />

        <ModalSuggestions 
            :show.sync="showCreateModal"
            :isEdit="isEdit"
            :form="form"
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
import FilterSuggestions from '@/projects/components/Filter/FilterSuggestions.vue'
import TableSuggestions from '@/projects/components/Table/TableSuggestions.vue'
import ModalSuggestions from '@/projects/components/Modal/ModalSuggestions.vue'
import * as XLSX from "xlsx"
import moment from "moment"

export default {
    name: 'Suggestions',
    components: {
        CompetenciesHeader,
        WidgetsCompetencyDetail,
        FilterSuggestions,
        TableSuggestions,
        ModalSuggestions,
    },
    data() {
        return {
            searchQuerySuggestions: '',
            selectionAcademicYearSuggestions: '',
            activePageSuggestions: 1,
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
                questions: [],
            },
            suggestionFields: [
                { key: 'year', label: 'YEAR', _classes: 'text-center', _style: 'min-width: 100px' },
                { key: 'title', label: 'TITLE', _classes: 'text-center', _style: 'min-width: 200px' },
                { key: 'suggestionContent', label: 'SUGGESTION CONTENT', _classes: 'text-center', _style: 'min-width: 300px' },
                { key: 'status', label: 'ACTIVE STATUS', _classes: 'text-center' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
        }
    },
    created() {
        this.fetchSuggestions()
    },
    computed: {
        ...mapState('competencies/proposition', ['proposition']),
        suggestionItems() {
            return this.proposition || []
        },
        activeSuggestionsCount() {
            return this.suggestionItems.filter(i => i.active).length
        },
        inactiveSuggestionsCount() {
            return this.suggestionItems.filter(i => !i.active).length
        },
        totalSuggestionsCount() {
            return this.suggestionItems.reduce((sum, item) => sum + (item.config ? item.config.length : 0), 0)
        },
        translate() {
            return (data, key = 'th') => {
                if (!data || !Array.isArray(data)) return data
                const found = data.find(i => i.key === key)
                return found ? found.value : (data[0] ? data[0].value : '')
            }
        },
        yearOptions() {
            const years = this.suggestionItems
                .map(item => item.year)
                .filter(year => year && year !== '')
            const uniqueYears = [...new Set(years)].sort((a, b) => b.localeCompare(a))
            
            return [
                { value: '', label: 'All Years' },
                ...uniqueYears.map(year => ({ value: year, label: year }))
            ]
        },
        filteredSuggestionItems() {
            let source = this.suggestionItems
            if (this.selectionAcademicYearSuggestions) {
                source = source.filter(item => item.year === this.selectionAcademicYearSuggestions)
            }
            if (this.searchQuerySuggestions && this.searchQuerySuggestions.trim() !== '') {
                const q = this.searchQuerySuggestions.toLowerCase().trim()
                source = source.filter(item => {
                    const titleText = (item.title ? JSON.stringify(item.title).toLowerCase() : '')
                    const descText = (item.description ? JSON.stringify(item.description).toLowerCase() : '')
                    const configText = item.config ? JSON.stringify(item.config).toLowerCase() : ''
                    return titleText.includes(q) || configText.includes(q) || descText.includes(q)
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
        ...mapActions('competencies/proposition', {
            fetchSuggestions: 'proposition',
            createSuggestion: 'createProposition',
            updateSuggestion: 'updateProposition',
            deleteSuggestion: 'deleteProposition'
        }),
        exportAssessment() {
            if (!this.suggestionItems.length) return

            const lang = 'th'
            const data = []

            this.suggestionItems.forEach(item => {
                const titleTh = this.translate(item.title, 'th')
                const titleEn = this.translate(item.title, 'en')

                if (item.config && item.config.length > 0) {
                    item.config.forEach((conf, idx) => {
                        data.push({
                            'Academic Year': item.year,
                            'Category Title (Thai)': titleTh,
                            'Category Title (English)': titleEn,
                            'No.': idx + 1,
                            'Topic (Thai)': this.translate(conf.label, 'th'),
                            'Topic (English)': this.translate(conf.label, 'en'),
                            'Suggestion (Thai)': this.translate(conf.question, 'th'),
                            'Suggestion (English)': this.translate(conf.question, 'en'),
                            'Comment': ''
                        })
                    })
                }
            })

            if (data.length === 0) return

            const worksheet = XLSX.utils.json_to_sheet(data)
            const workbook = XLSX.utils.book_new()
            XLSX.utils.book_append_sheet(workbook, worksheet, "Suggestions Assessment")

            const wscols = Object.keys(data[0]).map(key => ({ wch: Math.max(key.length, 20) }))
            worksheet['!cols'] = wscols

            XLSX.writeFile(workbook, `Suggestions_Assessment_Form_${moment().format('YYYY-MM-DD')}.xlsx`)
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
                let items = this.suggestionItems
                const target = items.find(i => i._id === id)
                if(!target) return
                
                await this.updateSuggestion({ _id: id, active: !target.active })
                this.fetchSuggestions()
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
            this.form.descriptionTh = item.description ? this.translate(item.description, 'th') : ''
            this.form.descriptionEn = item.description ? this.translate(item.description, 'en') : ''
            this.form.questions = (item.config || []).map(c => ({
                categoryTh: this.translate(c.label, 'th'),
                categoryEn: this.translate(c.label, 'en'),
                th: this.translate(c.question, 'th'),
                en: this.translate(c.question, 'en')
            }))
            this.showCreateModal = true
        },
        async deleteItem(id) {
            if(confirm('Are you sure you want to delete this Suggestion?')) {
                await this.deleteSuggestion(id)
                this.fetchSuggestions()
            }
        },
        async onSave() {
            if(!this.form.titleTh || !this.form.titleEn || !this.form.year) {
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
                await this.updateSuggestion(payload)
            } else {
                await this.createSuggestion(payload)
            }
            this.showCreateModal = false
            this.fetchSuggestions()
        }
    }
}
</script>

<style scoped>
/* Main View styles - Core layout if needed */
</style>
