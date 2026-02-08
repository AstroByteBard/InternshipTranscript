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
                                    <div class="d-flex align-items-baseline">
                                        <h5 class="mr-1">{{ selectedForm.title }}</h5>
                                    </div>

                                    <p class="mb-0">
                                        {{ selectedForm.description }}
                                    </p>
                                </div>

                                <!-- right -->
                                <CDropdown class="ms-auto" color="link" size="sm" :caret="false">
                                    <template #toggler-content>
                                        <CIcon name="cil-options" />
                                    </template>
                                    <CDropdownItem>Use</CDropdownItem>
                                    <CDropdownItem>Edit</CDropdownItem>
                                    <CDropdownItem>Duplicate</CDropdownItem>
                                    <CDropdownItem>Delete</CDropdownItem>
                                </CDropdown>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </div>

        <!-- Form In Not Use -->
        <div>
            <CRow class="d-flex align-items-center mb-3">
                <CCol>
                    <h3> Create Forms</h3>
                </CCol>

                <CCol col="auto">
                    <CButton color="danger" @click="addGeneralForm = true">
                        <CIcon name="cil-plus" />&nbsp;New
                    </CButton>
                </CCol>
            </CRow>

            <CRow v-for="form in forms" :key="form.id">
                <CCol>
                    <CCard class="form-card">
                        <CCardBody class="py-3">
                            <div class="d-flex align-items-center w-100 gap-3">

                                <!-- center -->
                                <div class="flex-grow-1 mx-4">
                                    <div class="d-flex align-items-baseline">
                                        <h5 class="mr-1">{{ form.title }}</h5>
                                        <span class="text-medium-emphasis small">
                                            / created {{ form.created }}
                                        </span>
                                    </div>

                                    <p class="mb-0">
                                        {{ form.description }}
                                    </p>
                                </div>

                                <!-- right -->
                                <CDropdown class="ms-auto" color="link" size="sm" :caret="false">
                                    <template #toggler-content>
                                        <CIcon name="cil-options" />
                                    </template>
                                    <CDropdownItem @click="selectForm(form.id)">Use</CDropdownItem>
                                    <CDropdownItem>Edit</CDropdownItem>
                                    <CDropdownItem>Duplicate</CDropdownItem>
                                    <CDropdownItem>Delete</CDropdownItem>
                                </CDropdown>
                            </div>
                        </CCardBody>
                    </CCard>
                </CCol>
            </CRow>
        </div>

        <CPagination
          align="end"
          :active-page.sync="currentPage"
          :pages="10"/>

        <CModal :centered="true" :show.sync="addGeneralForm" :close-on-backdrop="true">
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
            <template #header>
                <h6 class="modal-title">New General Competencies Form</h6>
                <CButtonClose @click="addGeneralForm = false" class="text-black" />
            </template>
            <template #footer>
                <CButton @click="addGeneralForm = false">Close</CButton>
                <CButton @click="submitForm" color="danger">Save</CButton>
            </template>
        </CModal>
    </div>
</template>

<script>
export default {
    name: 'general',
    components: {
    },
    data() {
        return {

            title: '',
            description: '',

            currentPage: 3,

            addGeneralForm: false,
            selectedFormId: null,
            forms: [
                {
                    id: 1,
                    title: 'Evaluation Form (2021)',
                    created: 'Jun 15, 2021',
                    description: 'Description of the form questions...'
                },
                {
                    id: 2,
                    title: 'Evaluation Form (2022)',
                    created: 'Jul 10, 2022',
                    description: 'Another description...'
                },
                {
                    id: 3,
                    title: 'Evaluation Form (2023)',
                    created: 'Aug 5, 2023',
                    description: 'Another description...'
                },
                {
                    id: 4,
                    title: 'Evaluation Form (2023)',
                    created: 'Aug 5, 2023',
                    description: 'Another description...'
                },
                {
                    id: 5,
                    title: 'Evaluation Form (2023)',
                    created: 'Aug 5, 2023',
                    description: 'Another description...'
                }
            ]
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

        },

        selectForm(id) {
            this.selectedFormId = id
        },

        submitForm() {
            console.log(this.title)
            console.log(this.description)
        }
    },

    computed: {
        selectedForm() {
            return this.forms.find(form => form.id === this.selectedFormId)
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
</style>