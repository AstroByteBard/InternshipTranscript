<template>
    <div>
        <CRow class="mb-3">
            <CCol col="6" sm="4" md="2" xl class="d-flex justify-content-end">
                <CButton color="danger" size="lg" @click="addGeneralForm = true">
                    <CIcon name="cil-plus" />&nbsp;Add
                </CButton>
            </CCol>
        </CRow>

        <CRow v-for="form in forms" :key="form.id">
          <CCol>
                <CCard :border-color="form.id === selectedFormId ? 'danger' : 'secondary'" class="form-card">
                    <CCardBody class="py-3">
                        <div class="d-flex align-items-center w-100 gap-3">

                            <!-- left -->
                            <CButton
                                size="sm"
                                :color="form.id === selectedFormId ? 'danger' : 'secondary'"
                                variant="outline"
                                class="px-3"
                                @click="selectForm(form.id)"
                            >
                                {{ form.id === selectedFormId ? 'Selected' : 'Select' }}
                            </CButton>

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
                                <CDropdownItem>Edit</CDropdownItem>
                                <CDropdownItem>Duplicate</CDropdownItem>
                                <CDropdownItem class="text-danger">Delete</CDropdownItem>
                            </CDropdown>

                        </div>
                    </CCardBody>
                </CCard>
          </CCol>
        </CRow>

        <CModal 
          :centered="true" 
          :show.sync="addGeneralForm" 
          :close-on-backdrop="true"
        >
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
        tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam,
        quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo
        consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
        cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
        proident, sunt in culpa qui officia deserunt mollit anim id est laborum
          <template #header>
            <h6 class="modal-title">New General Competencies Form</h6>
            <CButtonClose @click="addGeneralForm = false" class="text-black" />
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
            console.log(id)
            this.selectedFormId = id
        }
    },

    computed: {

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