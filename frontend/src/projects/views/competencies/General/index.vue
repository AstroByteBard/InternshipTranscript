<template>
    <div>
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
                                    <CDropdownItem @click="duplicateForm(selectedForm._id)">Duplicate</CDropdownItem>
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
                    <CButton color="danger" @click="addGeneralForm = true">
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

        <CModal :centered="true" :show.sync="addGeneralForm" :close-on-backdrop="true">
            <template #header>
                <h6 class="modal-title">New General Competencies Form</h6>
                <CButtonClose @click="addGeneralForm = false" class="text-black" />
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
                <CButton @click="addGeneralForm = false">Close</CButton>
                <CButton @click="createForm" color="danger">Save</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
    name: 'general',
    components: {
    },
    data() {
        return {
            title: '',
            description: '',
            currentPage: 1,
            addGeneralForm: false,
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
            this.$store.dispatch('competencies/general/general')
        },

        selectForm(_id) {
            const payload = {
                "_id": _id,
                "active": true,
            }
            this.$store.dispatch('competencies/general/updateGeneral', payload)
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
                        "value": this.title
                    }
                ],
                "description": [
                    {
                        "key": "th",
                        "value": "test"
                    },
                    {
                        "key": "en",
                        "value": this.description
                    }
                ],
                "active": false,
            }

            this.$store.dispatch('competencies/general/createGeneral', payload)
                .then(() => {
                    this.addGeneralForm = false
                    this.title = ''
                    this.description = ''
                })
        },

        duplicateForm(_id) {
            const payload = this.general.find(item => item._id === _id)

            delete payload._id
            delete payload.createdAt
            delete payload.updatedAt
            delete payload.__v

            payload.active = false

            this.$store.dispatch('competencies/general/createGeneral', payload)
        },

        deleteForm(_id) {
            const payload = {
                "_id": _id
            }
            this.$store.dispatch('competencies/general/deleteGeneral', payload)
        },

        editForm(_id) {
            this.$router.push({ name: 'GeneralDetail', params: { id: _id } })
        }
    },

    computed: {
        ...mapGetters('competencies/general', ['general']),

        formsData() {
            const lang = this.$i18n.locale

            return this.general.map(item => {
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