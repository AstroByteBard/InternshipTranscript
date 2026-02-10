<template>
    <div>
        <!-- Header Row -->
        <CRow class="mb-4 d-flex ">
            <CCol>
                <span class="cursor-pointer hover-underline" @click="$router.push({ name: 'General' })">General
                    Competencies</span>
                <CIcon name="cil-chevron-right" class="mx-2" size="sm" />
                <span style="color: #c12e2e; font-weight: 600;">{{ generalData.title }}</span>
            </CCol>
            <CCol col="auto">
                <CButton color="danger" @click="modalCompetency = true">
                    <CIcon name="cil-plus" /> &nbsp; Add
                </CButton>
            </CCol>
        </CRow>

        <!-- Competency List -->
        <div v-for="(item, index) in generalData.config" :key="item.id">
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
                        <CDropdownItem>Edit</CDropdownItem>
                        <CDropdownItem>Delete</CDropdownItem>
                    </CDropdown>
                </CCardBody>
            </CCard>
        </div>

        <CModal :centered="true" :show.sync="modalCompetency" :close-on-backdrop="true">
            <template #header>
                <h6 class="modal-title">Edit General Profiency</h6>
                <CButtonClose @click="modalCompetency = false" class="text-black" />
            </template>

            <div>
                <label>
                    General Skill Type TH
                </label>
                <CInput v-model="labelTH" placeholder="text Title here" />
            </div>

            <div>
                <label>
                    General Skill Type EN
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
    name: 'GeneralDetail',
    mixins: [optionsMixin],
    data() {
        return {
            labelTH: '',
            labelEN: '',
            questionTH: '',
            questionEN: '',
            modalCompetency: false,

        }
    },
    mounted() {
    },
    created() {
        this.$store.dispatch('competencies/general/general');
    },
    computed: {
        ...mapGetters('competencies/general', ['general']),
        ...mapGetters('competencies/question', ['question']),

        generalData() {
            const data = this.general.find(item => item._id === this.$route.params.id);
            return this.buildGeneralDataDetail(data)
        },
    },
    methods: {
        createCompetency() {
            const payload = {
                softskill: this.$route.params.id,
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
            this.$store.dispatch('competencies/question/createQuestion', payload).then(() => {
                this.modalCompetency = false
                this.labelTH = ''
                this.labelEN = ''
                this.questionTH = ''
                this.questionEN = ''
            })
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
