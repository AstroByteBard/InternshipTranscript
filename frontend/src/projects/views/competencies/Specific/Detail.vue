<template>
    <div>
        <!-- Header Row -->
        <CRow class="mb-4 d-flex ">
            <CCol>
                <span class="cursor-pointer hover-underline" @click="$router.push({ name: 'Specific' })">Specific
                    Competencies</span>
                <CIcon name="cil-chevron-right" class="mx-2" size="sm" />
                <span style="color: #c12e2e; font-weight: 600;">{{ specificData.title }}</span>
            </CCol>
            <CCol col="auto">
                <CButton color="danger" @click="openAddModal">
                    <CIcon name="cil-plus" /> &nbsp; Add
                </CButton>
            </CCol>
        </CRow>

        <!-- Competency List -->
        <div v-for="(item, index) in specificData.config" :key="item.id">
            <CCard class="mb-3 competency-card">
                <CCardBody class="p-3 d-flex align-items-center justify-content-between">
                    <div class="d-flex flex-column">
                        <div class="d-flex align-items-center">
                            <span class="competency-number">{{ index + 1 }}</span>
                            <span class="competency-title">{{ item.label ? item.label.value : '' }}</span>
                        </div>
                    </div>

                    <CDropdown color="link" size="sm" :caret="false" class="action-menu">
                        <template #toggler-content>
                            <CIcon name="cil-options" class="text-muted" />
                        </template>
                        <CDropdownItem @click="selectForEdit(item)">Edit</CDropdownItem>
                        <CDropdownItem @click="deleteCompetency(item._id)">Delete</CDropdownItem>
                    </CDropdown>
                </CCardBody>
            </CCard>
        </div>

        <CModal :centered="true" :show.sync="modalCompetency" :close-on-backdrop="true">
            <template #header>
                <h6 class="modal-title">{{ editMode ? 'Edit Specific Competency' : 'New Specific Competency' }}</h6>
                <CButtonClose @click="modalCompetency = false" class="text-black" />
            </template>

            <div>
                <label>
                    Specific Skill Type TH
                </label>
                <CInput v-model="labelTH" placeholder="text Title here" />
            </div>

            <div>
                <label>
                    Specific Skill Type EN
                </label>
                <CInput v-model="labelEN" placeholder="text Title here" />
            </div>

            <div>
                <label>
                    Set Questions TH
                </label>
                <CInput v-model="questionTH" placeholder="text Title here" />
            </div>

            <div>
                <label>
                    Set Questions EN
                </label>
                <CInput v-model="questionEN" placeholder="text Title here" />
            </div>

            <template #footer>
                <CButton @click="modalCompetency = false">Close</CButton>
                <CButton @click="createCompetency" color="danger">Save</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import optionsMixin from '@/mixins/optionsMixin'

export default {
    name: 'SpecificDetail',
    mixins: [optionsMixin],
    data() {
        return {
            labelTH: '',
            labelEN: '',
            questionTH: '',
            questionEN: '',
            questionEN: '', // Note: Assuming duplicate line from General/Detail was unintentional, but kept for strict cloning if needed. Removed second one to be clean.
            modalCompetency: false,
            editMode: false,
            editId: null,

        }
    },
    mounted() {
    },
    created() {
        this.$store.dispatch('competencies/specific/specific');
    },
    computed: {
        ...mapGetters('competencies/specific', ['specific']),


        specificData() {
            const data = this.specific.find(item => item._id === this.$route.params.id);
            return this.buildGeneralDataDetail(data)
        },
    },
    methods: {
        createCompetency() {
            const currentSpecific = this.specific.find(item => item._id === this.$route.params.id)
            if (!currentSpecific) return

            const newConfigItem = {
                _id: this.editMode ? this.editId : undefined, // Keep existing ID if editing
                label: [{
                    key: 'th',
                    value: this.labelTH
                }, {
                    key: 'en',
                    value: this.labelEN
                }],
                question: [{
                    key: 'th',
                    value: this.questionTH
                }, {
                    key: 'en',
                    value: this.questionEN
                }],
            }

            let newConfig = [...(currentSpecific.config || [])]

            if (this.editMode) {
                // Update existing item
                const index = newConfig.findIndex(item => item._id === this.editId)
                if (index !== -1) {
                    newConfig[index] = { ...newConfig[index], ...newConfigItem }
                }
            } else {
                // Add new item
                newConfig.push(newConfigItem)
            }

            const payload = {
                _id: currentSpecific._id,
                config: newConfig
            }

            this.$store.dispatch('competencies/specific/updateSpecific', payload).then(() => {
                this.modalCompetency = false
                this.resetForm()
            })
        },
        openAddModal() {
            this.resetForm()
            this.editMode = false
            this.modalCompetency = true
        },
        selectForEdit(item) {
            // Because item comes from buildGeneralDataDetail (mixins), it has simplified structure
            // We need to find the raw item from the store to get full data safely, or trust the mixin output.
            // Mixin output: { _id, label: {key, value}, question: {key, value} } ... wait, mixin finds BY LANG. 
            // We need all langs to populate the form.

            const currentSpecific = this.specific.find(g => g._id === this.$route.params.id)
            const rawItem = currentSpecific.config.find(c => c._id === item._id)

            if (!rawItem) return

            this.editId = rawItem._id
            this.editMode = true

            this.labelTH = rawItem.label.find(l => l.key === 'th')?.value || ''
            this.labelEN = rawItem.label.find(l => l.key === 'en')?.value || ''
            this.questionTH = rawItem.question.find(q => q.key === 'th')?.value || ''
            this.questionEN = rawItem.question.find(q => q.key === 'en')?.value || ''

            this.modalCompetency = true
        },
        resetForm() {
            this.labelTH = ''
            this.labelEN = ''
            this.questionTH = ''
            this.questionEN = ''
            this.editId = null
            this.editMode = false
        },
        deleteCompetency(id) {
            const currentSpecific = this.specific.find(item => item._id === this.$route.params.id)
            if (!currentSpecific) return

            // Filter out the item to be deleted
            const newConfig = (currentSpecific.config || []).filter(item => item._id !== id)

            const payload = {
                _id: currentSpecific._id,
                config: newConfig
            }

            // Dispatch update to save the new config array
            this.$store.dispatch('competencies/specific/updateSpecific', payload)
        }
    }
}
</script>

<style scoped>
.competency-number {
    color: #768192;
    font-weight: 500;
    min-width: 25px;
}

.competency-title {
    color: #3c4b64;
    font-weight: 500;
}
</style>
