<template>
    <div>

        <!-- Seachbar -->
        <div>
            <CCard>
                <CCardBody>
                    <CRow>
                        <CCol>
                            <h6> Schools </h6>
                            <CDropdown :togglerText="selectedSchool ? selectedSchool.label : 'Select School'"
                                addTogglerClasses="w-100" color="secondary">
                                <CDropdownItem v-for="item in formattedSchools" :key="item._id"
                                    @click="selectedSchool = item">
                                    {{ item.label }}
                                </CDropdownItem>
                            </CDropdown>
                        </CCol>

                        <CCol>
                            <h6> Majors </h6>
                            <CDropdown :togglerText="selectedProgram ? selectedProgram.label : 'Select Program'"
                                addTogglerClasses="w-100" color="secondary" :disabled="!selectedSchool">
                                <CDropdownItem v-for="item in filteredPrograms" :key="item._id"
                                    @click="selectedProgram = item">
                                    {{ item.label }}
                                </CDropdownItem>
                            </CDropdown>
                        </CCol>
                    </CRow>
                </CCardBody>
            </CCard>
        </div>

        <div v-if="selectedProgram">
            <!-- Form In Use -->
            <div>
                <CRow class="mb-3">
                    <CCol>
                        <h3>Form in Use </h3>
                    </CCol>
                </CRow>
                <CRow v-if="selectedForm">
                    <CCol>
                        <CCard class="form-card" accent-color="danger">
                            <CCardBody class="py-3">
                                <div class="d-flex align-items-center w-100 gap-3">

                                    <!-- center -->
                                    <div class="flex-grow-1 mx-4">
                                        <div class="d-flex flex-column">
                                            <h5 class="mb-1">{{ selectedForm.title }}</h5>
                                            <span class="mb-1"> {{ selectedForm.description }}</span>
                                            <span class="text-muted"> last edited {{ selectedForm.updatedAt }}</span>
                                        </div>
                                    </div>

                                    <!-- right -->
                                    <CDropdown class="ms-auto" color="link" size="sm" :caret="false">
                                        <template #toggler-content>
                                            <CIcon name="cil-options" />
                                        </template>
                                        <CDropdownItem @click="duplicateForm(selectedForm._id)">Duplicate
                                        </CDropdownItem>
                                        <CDropdownItem @click="editForm(selectedForm._id)">Edit</CDropdownItem>
                                        <CDropdownItem @click="deleteForm(selectedForm._id)">Delete</CDropdownItem>
                                    </CDropdown>
                                </div>
                            </CCardBody>
                        </CCard>
                    </CCol>
                </CRow>
                <div v-else>
                    <CCard class="py-5 text-center text-muted bg-light border-dashed">
                        <div>No Form Is in Use</div>
                    </CCard>
                </div>
            </div>

            <!-- Form In Not Use -->
            <div>
                <CRow class="d-flex align-items-center mb-3">
                    <CCol>
                        <h3> Create Forms </h3>
                    </CCol>

                    <CCol col="auto">
                        <CButton color="danger" @click="addSpecificForm = true">
                            <CIcon name="cil-plus" />&nbsp;New
                        </CButton>
                    </CCol>
                </CRow>

                <div v-if="forms.length > 0">
                    <CRow v-for="form in forms" :key="form._id">
                        <CCol>
                            <CCard class="form-card">
                                <CCardBody class="py-3">
                                    <div class="d-flex align-items-center w-100 gap-3">

                                        <!-- center -->
                                        <div class="flex-grow-1 mx-4">
                                            <div class="d-flex flex-column">
                                                <h5 class="mb-1">{{ form.title }}</h5>
                                                <span class="mb-1"> {{ form.description }}</span>
                                                <span class="text-muted"> last edited {{ form.updatedAt }}</span>
                                            </div>
                                        </div>

                                        <!-- right -->
                                        <CDropdown class="ms-auto" color="link" size="sm" :caret="false">
                                            <template #toggler-content>
                                                <CIcon name="cil-options" />
                                            </template>
                                            <CDropdownItem @click="selectForm(form._id)">Use</CDropdownItem>
                                            <CDropdownItem @click="editForm(form._id)">Edit</CDropdownItem>
                                            <CDropdownItem @click="duplicateForm(form._id)">Duplicate</CDropdownItem>
                                            <CDropdownItem @click="deleteForm(form._id)">Delete</CDropdownItem>
                                        </CDropdown>
                                    </div>
                                </CCardBody>
                            </CCard>
                        </CCol>
                    </CRow>
                </div>

                <div v-else>
                    <CCard class="py-5 text-center text-muted bg-light border-dashed">
                        <div>No Form Is Created</div>
                    </CCard>
                </div>
            </div>

            <CPagination align="end" :active-page.sync="currentPage" :pages="10" />

        </div>

        <div v-else class="d-flex justify-content-center align-items-center" style="min-height: 60vh;">
            <h3 class="text-muted"> Please Select School and Program </h3>
        </div>

        <CModal :centered="true" :show.sync="addSpecificForm" :close-on-backdrop="true">
            <template #header>
                <h6 class="modal-title">New Specific Competencies Form</h6>
                <CButtonClose @click="addSpecificForm = false" class="text-black" />
            </template>

            <div>
                <label>
                    Title
                </label>
                <CInput v-model="title" placeholder="text Title here" />
            </div>
            <div>
                <label>
                    Description
                </label>

                <CTextarea v-model="description" :rows="4" :maxlength="200"
                    placeholder="Description of the form questions written to help user use the correct form" />
                <div class="d-flex justify-content-end">{{ (description || '').length }}/200</div>
            </div>

            <template #footer>
                <CButton @click="addSpecificForm = false">Close</CButton>
                <CButton @click="createForm" color="danger">Save</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'specific',
    components: {
    },
    data() {
        return {
            title: '',
            description: '',
            currentPage: 1,
            addSpecificForm: false,
            selectedSchool: null,
            selectedProgram: null,
        }
    },

    mounted() {

    },

    created() {
        this.onInit();
    },

    beforeDestroy() {

    },

    methods: {
        onInit() {
            this.$store.dispatch('competencies/specific/specific')
            this.$store.dispatch("academic/programs/programs")
            this.$store.dispatch("academic/schools/schools")
        },

        selectForm(_id) {
            const payload = {
                "_id": _id,
                "active": true,
            }
            this.$store.dispatch('competencies/specific/updateSpecific', payload)
        },

        createForm() {
            const payload = {
                "title": [
                    {
                        "key": "th",
                        "value": "ทดสอบ"
                    },
                    {
                        "key": "en",
                        "value": "test"
                    }
                ],
                "description": [
                    {
                        "key": "th",
                        "value": "ทดสอบ"
                    },
                    {
                        "key": "en",
                        "value": "test"
                    }
                ],
                "active": false,
                "program": this.selectedProgram._id,
                "config": [
                    {
                        "label": [
                            {
                                "key": "th",
                                "value": "ทดสอบข้อที่ 1"
                            },
                            {
                                "key": "en",
                                "value": 'Test first question'
                            }
                        ],
                        "question": [
                            {
                                "key": "th",
                                "value": "ทดสอบข้อที่ 2"
                            },
                            {
                                "key": "en",
                                "value": "test second question"
                            }
                        ]
                    }
                ]

            }

            this.$store.dispatch('competencies/specific/createSpecific', payload)
                .then(() => {
                    this.addSpecificForm = false
                    this.title = ''
                    this.description = ''
                })
        },

        duplicateForm(_id) {
            const payload = this.specific.find(item => item._id === _id)

            delete payload._id
            delete payload.createdAt
            delete payload.updatedAt
            delete payload.__v

            payload.active = false

            this.$store.dispatch('competencies/specific/createSpecific', payload)
        },

        deleteForm(_id) {
            const payload = {
                "_id": _id
            }
            this.$store.dispatch('competencies/specific/deleteSpecific', payload)
        },

        editForm(_id) {
            this.$router.push({ name: 'SpecificDetail', params: { id: _id } })
        }
    },

    computed: {
        ...mapGetters('competencies/specific', ['specific']),
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),

        formattedSchools() {
            const lang = this.$i18n.locale
            if (!this.storedSchools) return []
            return this.storedSchools.map(item => {
                const titleObj = item.title.find(t => t.key === lang)
                return {
                    _id: item._id,
                    label: titleObj ? titleObj.value : ''
                }
            })
        },

        filteredPrograms() {
            const lang = this.$i18n.locale
            let source = this.storedPrograms || []

            if (this.selectedSchool) {
                source = source.filter(program => program.school === this.selectedSchool._id)
            }

            return source.map(item => {
                const titleObj = item.title.find(t => t.key === lang)
                return {
                    _id: item._id,
                    label: titleObj ? titleObj.value : ''
                }
            })
        },

        formsData() {
            if (!this.selectedProgram) return []

            const lang = this.$i18n.locale
            let source = this.specific

            if (this.selectedProgram) {
                source = source.filter(item => {
                    const programId = item.program && item.program._id ? item.program._id : item.program
                    return programId === this.selectedProgram._id
                })
            }

            return source.map(item => {
                // Handle potential missing keys gracefully
                const titleObj = item.title.find(t => t.key === lang)
                const descObj = item.description.find(d => d.key === lang)

                return {
                    _id: item._id, // Use _id matching backend
                    title: titleObj ? titleObj.value : '',
                    description: descObj ? descObj.value : '',
                    updatedAt: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : '',
                    active: item.active,
                }
            })
        },

        forms() {
            return this.formsData.filter(f => !f.active)
        },

        selectedForm() {
            return this.formsData.find(f => f.active)
        }
    },

    watch: {
        selectedSchool() {
            this.selectedProgram = null
        }
    }
}

</script>

<style>
.form-card {
    border-width: 2px !important;
    /* จาก default 1px → 2px */
}

.border-dashed {
    border-style: dashed !important;
}
</style>