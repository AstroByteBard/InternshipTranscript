<template>
    <div>
        <div v-if="!selectedProgram">
            <CTabs :active-tab.sync="activeTab" variant="tabs" class="custom-tabs mt-0">
                <!-- Tab 1: Student -->
                <CTab title="Student">
                    <CCard class="border-0 shadow-sm mt-3 overflow-hidden" style="border-radius: 20px;">
                        <CCardBody class="p-0">
                            <!-- Widgets (Always Visible) -->
                            <div class="px-4 pt-4">
                                <WidgetsCorrespondence 
                                    :emailReady="isStudentEmailReady"
                                    :total="storedStudents.length" 
                                    :pending="studentPendingCount" 
                                    :sent="studentSentCount" 
                                    :failed="0" 
                                    class="mb-0"
                                    style="box-shadow: none !important; border: none !important; background: transparent !important;"
                                />
                            </div>

                            <!-- Filter Bar (Always Visible) -->
                            <div class="px-4 py-3 border-top border-bottom modern-filter-bar">
                                <CRow class="align-items-center">
                                    <CCol md="3">
                                        <div class="search-input-wrapper">
                                            <CIcon name="cil-search" class="search-icon" />
                                            <input type="text" class="form-control search-input" placeholder="Search..." v-model="internalSearch" />
                                        </div>
                                    </CCol>
                                    <CCol md="9">
                                        <div class="d-flex justify-content-end align-items-center flex-wrap">
                                            <!-- Hide filters when in template mode -->
                                            <template v-if="!showTemplates">
                                                <CSelect custom class="modern-select-filter mb-0 mr-2" style="width: 150px;" :options="schools" :value.sync="internalSchool" />
                                                <CSelect custom class="modern-select-filter mb-0 mr-2" style="width: 150px;" :options="programs" :value.sync="internalProgram" />
                                                <CSelect custom class="modern-select-filter mb-0 mr-3" style="width: 110px;" :options="statuses" :value.sync="internalStatus" />
                                            </template>
                                            
                                            <div class="d-flex border-left pl-3 ml-1">
                                                <CButton :color="showTemplates ? 'secondary' : 'primary'" variant="outline" class="mr-2 modern-action-btn" @click="showTemplates = !showTemplates">
                                                    <CIcon :name="showTemplates ? 'cil-arrow-left' : 'cil-description'" class="mr-1"/> 
                                                    {{ showTemplates ? 'Back to Students' : 'Email Template' }}
                                                </CButton>
                                                <CButton v-if="!showTemplates" color="primary" class="modern-action-btn" @click="sendBulkEmail('all')">
                                                    <CIcon name="cil-paper-plane" class="mr-1"/> Send Email All
                                                </CButton>
                                                <CButton v-if="showTemplates" color="primary" class="modern-action-btn" @click="$refs.modalTemplate.openAdd()">
                                                    <CIcon name="cil-plus" class="mr-1"/> Create New
                                                </CButton>
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </div>

                            <!-- Content Switcher: Student Table or Template Table -->
                            <div v-if="!showTemplates">
                                <CDataTable class="custom-table mb-0" :items="programsTable" :fields="fields" :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="activePage">
                                    <template #under-table>
                                        <div class="d-flex justify-content-between align-items-center px-4 py-3" style="border-top: 1px solid #f3f4f6;">
                                            <div class="text-muted" style="font-size: 13px;">Showing {{ tableStartItem }} to {{ tableEndItem }} of {{ programsTable.length }} results</div>
                                            <CPagination :activePage.sync="activePage" :pages="totalPages" :doubleArrows="false" align="end" class="mb-0 custom-pagination" />
                                        </div>
                                    </template>
                                    <template #sendStatus="{ item }">
                                        <td class="text-center align-middle">
                                            <div class="status-pill" :class="getStatusClass(item.sendStatus)">
                                                {{ formatSendStatus(item.sendStatus) }}
                                            </div>
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
                                                <CDropdownItem class="px-3 py-2 text-dark font-weight-bold" @click="sendEmail(item._id)">
                                                    Send Email
                                                </CDropdownItem>
                                                <CDropdownItem class="px-3 py-2 text-dark" @click="openViewModal(item)">
                                                    View
                                                </CDropdownItem>
                                                <CDropdownItem class="px-3 py-2 text-dark" @click="selectProgram(item)">
                                                    Detail
                                                </CDropdownItem>
                                            </CDropdown>
                                        </td>
                                    </template>
                                </CDataTable>
                            </div>

                            <div v-else class="pb-4">
                                <div v-if="emailsData.length === 0" class="p-5 text-center">
                                    <CIcon name="cil-description" size="xl" class="text-muted mb-3" />
                                    <p class="text-muted">No templates found. Create one to get started.</p>
                                </div>
                                <div v-else class="table-responsive">
                                    <table class="table custom-template-table mb-0">
                                        <thead>
                                            <tr>
                                                <th class="pl-4" style="width: 40%;">TEMPLATE DETAILS</th>
                                                <th style="width: 20%;" class="text-center">CREATED DATE</th>
                                                <th style="width: 20%;" class="text-center">ACTIVE STATUS</th>
                                                <th style="width: 20%;" class="text-right pr-4">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="email in emailsData" :key="email._id">
                                                <td class="pl-4">
                                                    <div class="font-weight-bold" style="color: #1e293b; font-size: 15px;">{{ email.title }}</div>
                                                    <div class="text-muted mt-1" style="font-size: 13px;">{{ email.description }}</div>
                                                </td>
                                                <td class="text-center text-muted" style="font-size: 14px;">
                                                    <CIcon name="cil-clock" size="sm" class="mr-1" /> {{ email.updatedAt.split(' ')[0] }}
                                                </td>
                                                <td class="text-center">
                                                    <div v-if="email.active" class="d-inline-flex align-items-center font-weight-bold text-success">
                                                        <CIcon name="cil-check-circle" class="mr-1" style="width: 16px; height: 16px;" /> Active
                                                    </div>
                                                    <div v-else class="d-inline-flex align-items-center text-muted cursor-pointer" @click="useTemplate(email._id)">
                                                        <div class="mr-2" style="width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1;"></div> Inactive
                                                    </div>
                                                </td>
                                                <td class="text-right pr-4">
                                                    <CButton variant="ghost" color="secondary" size="sm" class="btn-action-icon mr-2" @click="openEditModal(email)"><CIcon name="cil-pencil" /></CButton>
                                                    <CButton variant="ghost" color="secondary" size="sm" class="btn-action-icon" @click="removeEmail(email._id)"><CIcon name="cil-trash" /></CButton>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CTab>

                <!-- Tab 2: Adviser -->
                <CTab title="Adviser">
                    <CCard class="border-0 shadow-sm mt-3 overflow-hidden" style="border-radius: 20px;">
                        <CCardBody class="p-0">
                            <!-- Widgets (Adviser) -->
                            <div class="px-4 pt-4">
                                <WidgetsCorrespondence 
                                    :emailReady="isAdviserEmailReady"
                                    :total="storedAdvisors.length" 
                                    :pending="adviserPendingCount" 
                                    :sent="adviserSentCount" 
                                    :failed="0" 
                                    class="mb-0"
                                    style="box-shadow: none !important; border: none !important; background: transparent !important;"
                                />
                            </div>

                            <!-- Filter Bar (Adviser) -->
                            <div class="px-4 py-3 border-top border-bottom modern-filter-bar">
                                <CRow class="align-items-center">
                                    <CCol md="3">
                                        <div class="search-input-wrapper">
                                            <CIcon name="cil-search" class="search-icon" />
                                            <input type="text" class="form-control search-input" placeholder="Search Adviser/Org..." v-model="internalAdviserSearch" />
                                        </div>
                                    </CCol>
                                    <CCol md="9">
                                        <div class="d-flex justify-content-end align-items-center flex-wrap">
                                            <template v-if="!showAdviserTemplates">
                                                <CSelect custom class="modern-select-filter mb-0 mr-2" style="width: 150px;" :options="schools" :value.sync="internalAdviserSchool" />
                                                <CSelect custom class="modern-select-filter mb-0 mr-3" style="width: 110px;" :options="statuses" :value.sync="internalAdviserStatus" />
                                            </template>
                                            
                                            <div class="d-flex border-left pl-3 ml-1">
                                                <CButton :color="showAdviserTemplates ? 'secondary' : 'primary'" variant="outline" class="mr-2 modern-action-btn" @click="showAdviserTemplates = !showAdviserTemplates">
                                                    <CIcon :name="showAdviserTemplates ? 'cil-arrow-left' : 'cil-description'" class="mr-1"/> 
                                                    {{ showAdviserTemplates ? 'Back to Advisers' : 'Email Template' }}
                                                </CButton>
                                                <CButton v-if="!showAdviserTemplates" color="primary" class="modern-action-btn" @click="sendBulkAdviserEmail()">
                                                    <CIcon name="cil-paper-plane" class="mr-1"/> Send Email All
                                                </CButton>
                                                <CButton v-if="showAdviserTemplates" color="primary" class="modern-action-btn" @click="$refs.modalTemplateAdviser.openAdd()">
                                                    <CIcon name="cil-plus" class="mr-1"/> Create New
                                                </CButton>
                                            </div>
                                        </div>
                                    </CCol>
                                </CRow>
                            </div>

                            <!-- Content Switcher: Adviser Table or Template Table -->
                            <div v-if="!showAdviserTemplates">
                                <CDataTable class="custom-table mb-0" :items="advisersTable" :fields="adviserFields" :items-per-page="itemsPerPage" :pagination="false" hover :activePage.sync="adviserActivePage">
                                    <template #under-table>
                                        <div class="d-flex justify-content-between align-items-center px-4 py-3" style="border-top: 1px solid #f3f4f6;">
                                            <div class="text-muted" style="font-size: 13px;">Showing {{ adviserTableStartItem }} to {{ adviserTableEndItem }} of {{ advisersTable.length }} results</div>
                                            <CPagination :activePage.sync="adviserActivePage" :pages="adviserTotalPages" :doubleArrows="false" align="end" class="mb-0 custom-pagination" />
                                        </div>
                                    </template>
                                    <template #organizationName="{ item }">
                                        <td class="align-middle">
                                            <div class="font-weight-bold" style="color: #1e293b;">{{ item.organizationName }}</div>
                                            <div v-if="item.organizationAddress" class="text-muted mt-1" style="font-size: 12px;">{{ item.organizationAddress }}</div>
                                        </td>
                                    </template>
                                    <template #sendStatus="{ item }">
                                        <td class="text-center align-middle">
                                            <div class="status-text" :class="getStatusClass(item.sendStatus)">
                                                {{ formatSendStatus(item.sendStatus) }}
                                            </div>
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
                                                <CDropdownItem class="px-3 py-2 text-dark font-weight-bold" @click="sendAdviserEmail(item._id)">
                                                    Send Email
                                                </CDropdownItem>
                                                <CDropdownItem class="px-3 py-2 text-dark" @click="selectProgram(item)">
                                                    View
                                                </CDropdownItem>
                                                <CDropdownItem class="px-3 py-2 text-dark" @click="selectProgram(item)">
                                                    Detail
                                                </CDropdownItem>
                                            </CDropdown>
                                        </td>
                                    </template>
                                </CDataTable>
                            </div>

                            <!-- Adviser Email Template List -->
                            <div v-else class="pb-4">
                                <div v-if="adviserEmailsData.length === 0" class="p-5 text-center">
                                    <CIcon name="cil-description" size="xl" class="text-muted mb-3" />
                                    <p class="text-muted">No templates found for advisers.</p>
                                </div>
                                <div v-else class="table-responsive">
                                    <table class="table custom-template-table mb-0">
                                        <thead>
                                            <tr>
                                                <th class="pl-4" style="width: 40%;">TEMPLATE DETAILS</th>
                                                <th style="width: 20%;" class="text-center">CREATED DATE</th>
                                                <th style="width: 20%;" class="text-center">ACTIVE STATUS</th>
                                                <th style="width: 20%;" class="text-right pr-4">ACTIONS</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="email in adviserEmailsData" :key="email._id">
                                                <td class="pl-4">
                                                    <div class="font-weight-bold" style="color: #1e293b; font-size: 15px;">{{ email.title }}</div>
                                                    <div class="text-muted mt-1" style="font-size: 13px;">{{ email.description }}</div>
                                                </td>
                                                <td class="text-center text-muted" style="font-size: 14px;">
                                                    <CIcon name="cil-clock" size="sm" class="mr-1" /> {{ email.updatedAt.split(' ')[0] }}
                                                </td>
                                                <td class="text-center">
                                                    <div v-if="email.active" class="d-inline-flex align-items-center font-weight-bold text-success">
                                                        <CIcon name="cil-check-circle" class="mr-1" style="width: 16px; height: 16px;" /> Active
                                                    </div>
                                                    <div v-else class="d-inline-flex align-items-center text-muted cursor-pointer" @click="useAdviserTemplate(email._id)">
                                                        <div class="mr-2" style="width: 14px; height: 14px; border-radius: 50%; border: 1px solid #cbd5e1;"></div> Inactive
                                                    </div>
                                                </td>
                                                <td class="text-right pr-4">
                                                    <CButton variant="ghost" color="secondary" size="sm" class="btn-action-icon mr-2" @click="openAdviserEditModal(email)"><CIcon name="cil-pencil" /></CButton>
                                                    <CButton variant="ghost" color="secondary" size="sm" class="btn-action-icon" @click="removeAdviserEmail(email._id)"><CIcon name="cil-trash" /></CButton>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </CCardBody>
                    </CCard>
                </CTab>
            </CTabs>
        </div>

        <!-- Detail View Section -->
        <div v-else class="detail-section">
            <CCard class="border-0 shadow-sm" style="border-radius: 20px; overflow: hidden;">
                <CCardBody class="p-0">
                    <!-- Header with Back Button -->
                    <div class="px-4 py-3 border-bottom d-flex align-items-center justify-content-between bg-light">
                        <div class="d-flex align-items-center">
                            <CButton variant="ghost" color="secondary" class="mr-3 rounded-circle" @click="selectedProgram = null">
                                <CIcon name="cil-arrow-left" />
                            </CButton>
                            <div>
                                <h5 class="mb-0 font-weight-bold text-dark">{{ activeTab === 0 ? 'Student Detail' : 'Adviser Detail' }}</h5>
                                <div class="text-muted small">Viewing details for {{ selectedProgram.student || selectedProgram.organizationName }}</div>
                            </div>
                        </div>
                        <div class="status-pill" :class="getStatusClass(selectedProgram.sendStatus)">
                            <CIcon :name="getStatusIcon(selectedProgram.sendStatus)" size="sm" class="mr-1" />
                            {{ formatSendStatus(selectedProgram.sendStatus) }}
                        </div>
                    </div>

                    <!-- Detail Content -->
                    <div class="p-4">
                        <CRow>
                            <CCol md="6">
                                <div class="detail-group mb-4">
                                    <label class="detail-label">Name / Organization</label>
                                    <div class="detail-value font-weight-bold">{{ selectedProgram.student || selectedProgram.organizationName }}</div>
                                </div>
                                <div v-if="activeTab === 0" class="detail-group mb-4">
                                    <label class="detail-label">Student ID</label>
                                    <div class="detail-value">{{ selectedProgram.id }}</div>
                                </div>
                                <div v-else class="detail-group mb-4">
                                    <label class="detail-label">Email Address</label>
                                    <div class="detail-value">{{ selectedProgram.email }}</div>
                                </div>
                            </CCol>
                            <CCol md="6">
                                <div class="detail-group mb-4">
                                    <label class="detail-label">Status</label>
                                    <div class="detail-value text-uppercase" :class="activeTab === 0 && selectedProgram.sendStatus === 'COMPLETE' ? 'text-success' : ''">
                                        {{ selectedProgram.sendStatus }}
                                    </div>
                                </div>
                                <div v-if="activeTab === 0" class="detail-group mb-4">
                                    <label class="detail-label">School / Program</label>
                                    <div class="detail-value">{{ selectedProgram.schoolName }} / {{ selectedProgram.programName }}</div>
                                </div>
                                <div v-else class="detail-group mb-4">
                                    <label class="detail-label">Organization Address</label>
                                    <div class="detail-value">{{ selectedProgram.organizationAddress || 'N/A' }}</div>
                                </div>
                            </CCol>
                        </CRow>

                        <div class="border-top pt-4 mt-2">
                            <h6 class="font-weight-bold mb-3">Communication Timeline</h6>
                            <div class="text-center py-5 bg-light rounded-lg border border-dashed">
                                <CIcon name="cil-history" size="xl" class="text-muted mb-2" />
                                <p class="text-muted mb-0">Timeline functionality coming soon</p>
                            </div>
                        </div>
                    </div>

                    <!-- Actions Footer -->
                    <div class="px-4 py-3 border-top bg-white d-flex justify-content-end">
                        <CButton color="primary" class="modern-action-btn px-4" @click="activeTab === 0 ? sendEmail(selectedProgram._id) : sendAdviserEmail(selectedProgram._id)">
                            <CIcon name="cil-paper-plane" class="mr-2" /> Resend Email
                        </CButton>
                    </div>
                </CCardBody>
            </CCard>
        </div>

        <ModalEmailTemplate ref="modalTemplate" @refresh="loadData" />

        <!-- Bulk Send Confirmation Modal -->
        <CModal :show.sync="showBulkConfirmModal" :centered="true" class="modern-modal" size="lg">
          <template #header>
            <h5 class="modal-title font-weight-bold text-danger"><CIcon name="cil-warning" class="mr-2"/> ยืนยันการส่งอีเมลแบบกลุ่ม</h5>
            <CButtonClose @click="showBulkConfirmModal = false" />
          </template>
          <div class="p-4">
            <div class="alert alert-warning border-0 shadow-sm mb-4" style="border-radius: 12px; background-color: #fffbeb;">
                <h6 class="font-weight-bold text-warning-emphasis mb-2">คำแนะนำสำคัญ (Important Instruction)</h6>
                <p class="mb-0 small text-muted">กรุณาตรวจสอบการเลือก School และ Program ในแถบ Filter ให้ถูกต้องก่อนส่ง</p>
            </div>
            <div class="text-center py-3">
                <div class="display-4 font-weight-bold text-primary mb-2">{{ pendingItemsToBulkSend.length }}</div>
                <div class="text-muted font-weight-bold">จำนวนนักศึกษาที่จะได้รับอีเมล (Pending Students)</div>
            </div>
          </div>
          <template #footer>
            <CButton color="secondary" variant="ghost" class="font-weight-bold" @click="showBulkConfirmModal = false">ยกเลิก</CButton>
            <CButton color="primary" class="px-4 font-weight-bold modern-modal-btn" @click="confirmAndSendBulk">ยืนยันการส่งทั้งหมด</CButton>
          </template>
        </CModal>

        <!-- View Item Modal -->
        <CModal :show.sync="showViewModal" :centered="true" class="modern-modal" size="lg">
          <template #header>
            <h5 class="modal-title font-weight-bold text-dark">
                <CIcon name="cil-find-in-page" class="mr-2 text-info"/> 
                {{ activeTab === 0 ? 'Student' : 'Adviser' }} Details
            </h5>
            <CButtonClose @click="showViewModal = false" />
          </template>
          <div v-if="viewItem" class="p-4">
            <CRow>
                <CCol md="6">
                    <div class="detail-group mb-4">
                        <label class="detail-label">Name / Organization</label>
                        <div class="detail-value font-weight-bold">{{ viewItem.student || viewItem.organizationName }}</div>
                    </div>
                    <div v-if="activeTab === 0" class="detail-group mb-4">
                        <label class="detail-label">Student ID</label>
                        <div class="detail-value">{{ viewItem.id }}</div>
                    </div>
                    <div v-else class="detail-group mb-4">
                        <label class="detail-label">Email Address</label>
                        <div class="detail-value text-primary">{{ viewItem.email }}</div>
                    </div>
                </CCol>
                <CCol md="6">
                    <div class="detail-group mb-4">
                        <label class="detail-label">Current Status</label>
                        <div>
                            <span class="status-pill" :class="getStatusClass(viewItem.sendStatus)">
                                {{ formatSendStatus(viewItem.sendStatus) }}
                            </span>
                        </div>
                    </div>
                    <div v-if="activeTab === 0" class="detail-group mb-4">
                        <label class="detail-label">School / Program</label>
                        <div class="detail-value">{{ viewItem.schoolName }} / {{ viewItem.programName }}</div>
                    </div>
                    <div v-else class="detail-group mb-4">
                        <label class="detail-label">Organization Address</label>
                        <div class="detail-value">{{ viewItem.organizationAddress || 'N/A' }}</div>
                    </div>
                </CCol>
            </CRow>
            
            <div class="mt-2 border-top pt-3">
                <div class="d-flex justify-content-between align-items-center mb-3">
                    <h6 class="font-weight-bold mb-0">System Log</h6>
                    <span class="badge badge-light">Last Activity: Just now</span>
                </div>
                <div class="bg-light p-3 rounded-lg border">
                    <div class="d-flex mb-2">
                        <div class="mr-3 text-muted small" style="min-width: 70px;">02:25 AM</div>
                        <div class="small">System initialized correspondence record for this entry.</div>
                    </div>
                    <div class="d-flex">
                        <div class="mr-3 text-muted small" style="min-width: 70px;">02:25 AM</div>
                        <div class="small">Waiting for user to trigger initial email template.</div>
                    </div>
                </div>
            </div>
          </div>
          <template #footer>
            <CButton color="secondary" variant="ghost" class="font-weight-bold" @click="showViewModal = false">Close</CButton>
            <CButton color="primary" class="px-4 font-weight-bold modern-modal-btn" @click="showViewModal = false; activeTab === 0 ? sendEmail(viewItem._id) : sendAdviserEmail(viewItem._id)">
                Send Email Now
            </CButton>
          </template>
        </CModal>
    </div>
</template>

<script>
import { mapGetters } from 'vuex'
import ModalEmailTemplate from '@/projects/components/Modal/ModalEmailTemplate.vue'
import ModalEmailTemplateAdviser from '@/projects/components/Modal/ModalEmailTemplateAdviser.vue'
import WidgetsCorrespondence from '@/projects/components/widgets/WidgetsCorrespondence.vue'

export default {
    name: 'StudentEmailSection',
    components: { ModalEmailTemplate, ModalEmailTemplateAdviser, WidgetsCorrespondence },
    props: {
        searchQuery: { type: String, default: '' },
        school: { type: String, default: null },
        program: { type: String, default: null },
        year: { type: [String, Number], default: null },
        status: { type: String, default: null },
    },
    data() {
        return {
            selectedProgram: null,
            activePage: 1,
            adviserActivePage: 1,
            itemsPerPage: 5,
            activeTab: 0,
            showTemplates: false,
            showAdviserTemplates: false,
            internalSearch: '',
            internalSchool: null,
            internalProgram: null,
            internalStatus: null,
            internalAdviserSearch: '',
            internalAdviserSchool: null,
            internalAdviserStatus: null,
            fields: [
                { key: 'id', label: 'ID', _style: 'min-width: 100px' },
                { key: 'student', label: 'STUDENT', _style: 'min-width: 100px' },
                { key: 'schoolName', label: 'SCHOOL NAME', _style: 'min-width: 300px' },
                { key: 'programName', label: 'PROGRAM NAME', _style: 'min-width: 300px' },
                { key: 'academicYear', label: 'ACADEMIC YEAR', _style: 'min-width: 100px' },
                { key: 'sendStatus', label: 'STATUS', _classes: 'text-center' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
            adviserFields: [
                { key: 'organizationName', label: 'ORGANIZATION', _style: 'min-width: 250px' },
                { key: 'email', label: 'EMAIL', _style: 'min-width: 180px' },
                { key: 'student', label: 'STUDENT NAME', _style: 'min-width: 180px' },
                { key: 'sendStatus', label: 'STATUS', _classes: 'text-center' },
                { key: 'actions', label: 'ACTIONS', _classes: 'text-center', sorter: false, filter: false },
            ],
            showBulkConfirmModal: false,
            showViewModal: false,
            viewItem: null,
            bulkType: null,
            pendingItemsToBulkSend: []
        }
    },
    created() {
        this.loadData()
    },
    methods: {
        loadData() {
            this.$store.dispatch('email/emailStudent/email')
            this.$store.dispatch('email/emailAdviser/email')
            this.$store.dispatch('member/students/students')
            this.$store.dispatch('member/advisors/advisors')
            this.$store.dispatch('academic/schools/schools')
            this.$store.dispatch('academic/programs/programs')
        },
        getStatusClass(status) {
            const map = { COMPLETE: 'status-replied', FAILED: 'status-closed', PENDING: 'status-pending' }
            return map[status] ?? 'status-pending'
        },
        getStatusIcon(status) {
            const map = { COMPLETE: 'cil-check-circle', FAILED: 'cil-warning', PENDING: 'cil-clock' }
            return map[status] ?? 'cil-clock'
        },
        formatSendStatus(status) {
            if (!status) return 'Pending'
            return status.charAt(0) + status.slice(1).toLowerCase()
        },
        openViewModal(item) {
            this.viewItem = item;
            this.showViewModal = true;
        },
        selectProgram(program) { this.selectedProgram = program },
        openEditModal(email) { this.$refs.modalTemplate.openEdit(email) },
        useTemplate(_id) {
            this.$store.dispatch('email/emailStudent/updateEmail', { _id, active: true })
        },
        sendEmail(_id) {
            const activeTemplate = this.emailsData.find(t => t.active);
            const templateId = activeTemplate ? activeTemplate._id : '6973168131640a4d402b0682'; // Fallback to hardcoded if none active
            return this.$store.dispatch('email/emailStudent/sendEmail', { _id, templete: templateId });
        },
        removeEmail(_id) {
            this.$store.dispatch('email/emailStudent/deleteEmail', { _id })
        },
        // Adviser Methods
        openAdviserEditModal(email) { this.$refs.modalTemplateAdviser.openEdit(email) },
        useAdviserTemplate(_id) {
            this.$store.dispatch('email/emailAdviser/updateEmail', { _id, active: true })
        },
        sendAdviserEmail(_id) {
            const activeTemplate = this.adviserEmailsData.find(t => t.active);
            const templateId = activeTemplate ? activeTemplate._id : '6973168131640a4d402b0682';
            return this.$store.dispatch('email/emailAdviser/sendEmail', { _id, templete: templateId });
        },
        removeAdviserEmail(_id) {
            this.$store.dispatch('email/emailAdviser/deleteEmail', { _id })
        },
        async sendBulkAdviserEmail() {
            const pending = this.advisersTable.filter(item => item.sendStatus === 'PENDING');
            if (pending.length === 0) {
                alert('No pending advisers found.');
                return;
            }
            if (!confirm(`Confirm sending email to ${pending.length} pending advisers?`)) return;

            this.$store.commit('dialog/loading', true);
            this.$store.commit('dialog/loadingMessage', 'Sending...');
            for (const item of pending) {
                await this.sendAdviserEmail(item._id);
            }
            this.$store.commit('dialog/loading', false);
            this.loadData();
        },
        async sendBulkEmail(type) {
            this.bulkType = type;
            this.pendingItemsToBulkSend = this.programsTable.filter(item => item.sendStatus === 'PENDING');
            
            if (this.pendingItemsToBulkSend.length === 0) {
                alert('No pending students found in current filtered list.');
                return;
            }

            this.showBulkConfirmModal = true;
        },

        async confirmAndSendBulk() {
            this.showBulkConfirmModal = false;
            
            this.$store.commit('dialog/loading', true);
            this.$store.commit('dialog/loadingMessage', 'กำลังเตรียมการส่ง...');

            let successCount = 0;
            let total = this.pendingItemsToBulkSend.length;

            for (let i = 0; i < total; i++) {
                const item = this.pendingItemsToBulkSend[i];
                try {
                    this.$store.commit('dialog/loadingMessage', `กำลังส่งลำดับที่ ${i + 1} จาก ${total}...`);
                    await this.sendEmail(item._id);
                    successCount++;
                } catch (error) {
                    console.error(`Failed to send email to ${item._id}:`, error);
                }
            }
            
            this.$store.commit('dialog/loadingMessage', `ส่งสำเร็จ ${successCount} รายการ`);
            setTimeout(() => {
                this.$store.commit('dialog/loading', false);
                this.loadData();
            }, 2000);
        }
    },
    computed: {
        ...mapGetters('academic/schools', { storedSchools: 'schools' }),
        ...mapGetters('academic/programs', { storedPrograms: 'programs' }),
        ...mapGetters('email/emailStudent', ['emailStudent']),
        ...mapGetters('email/emailAdviser', ['emailAdviser']),
        ...mapGetters('member/students', { storedStudents: 'students' }),
        ...mapGetters('member/advisors', { storedAdvisors: 'advisors' }),

        programsTable() {
            const lang = this.$i18n.locale
            let source = this.storedStudents || []

            if (this.internalSchool) {
                source = source.filter(s => {
                    const id = s.info?.school?._id ?? s.info?.school ?? null
                    return id === this.internalSchool
                })
            }
            if (this.internalProgram) {
                source = source.filter(s => {
                    const id = s.info?.program?._id ?? s.info?.program ?? null
                    return id === this.internalProgram
                })
            }
            if (this.internalYear) {
                source = source.filter(s => s.info?.year === this.internalYear.toString())
            }
            if (this.internalStatus) {
                source = source.filter(s => {
                    const currentStat = s.evaluation ? 'COMPLETE' : 'PENDING';
                    return currentStat === this.internalStatus;
                })
            }
            if (this.internalSearch.trim()) {
                const q = this.internalSearch.toLowerCase().trim()
                const getT = t => (Array.isArray(t) ? (t.find(x => x.key === lang) ?? t[0])?.value ?? '' : t ?? '')
                source = source.filter(s =>
                    getT(s.name).toLowerCase().includes(q) || (s.studentID ?? '').toLowerCase().includes(q)
                )
            }

            const getTitle = t => (Array.isArray(t) ? (t.find(x => x.key === lang) ?? t[0])?.value ?? 'N/A' : t ?? 'N/A')
            return source.map((item, index) => {
                const info = item.info || {}
                const program = info.program?.title ? info.program : this.storedPrograms.find(p => p._id === info.program) ?? null
                const school = info.school?.title ? info.school : this.storedSchools.find(s => s._id === info.school) ?? null
                return {
                    _id: item._id,
                    id: item.studentID ?? `COR-00${index + 1}`,
                    student: getTitle(item.name),
                    schoolName: school ? getTitle(school.title) : 'N/A',
                    programName: program ? getTitle(program.title) : 'N/A',
                    academicYear: info.year ?? 'N/A',
                    semester: info.semester ?? 'N/A',
                    sendStatus: item.evaluation ? 'COMPLETE' : 'PENDING',
                }
            })
        },

        emailsData() {
            const lang = this.$i18n.locale
            if (!this.emailStudent) return []
            return this.emailStudent.map(item => ({
                _id: item._id,
                title: item.title?.find?.(t => t.key === lang)?.value ?? item.title ?? '',
                description: item.description?.find?.(d => d.key === lang)?.value ?? item.description ?? '',
                templete: item.templete,
                active: item.active,
                updatedAt: this.moment(item.updatedAt).format('DD/MM/YYYY HH:mm'),
            }))
        },

        schools() {
            const lang = this.$i18n.locale
            return [
                { value: null, label: 'All Schools' },
                ...(this.storedSchools ?? []).map(item => ({ value: item._id, label: item.title?.find?.(t => t.key === lang)?.value ?? item.title ?? '' }))
            ]
        },

        programs() {
            const lang = this.$i18n.locale
            let progs = this.storedPrograms ?? []
            if (this.internalSchool) progs = progs.filter(p => p.school === this.internalSchool)
            return [
                { value: null, label: 'All Programs' },
                ...progs.map(item => ({ value: item._id, label: item.title?.find?.(t => t.key === lang)?.value ?? item.title ?? '' }))
            ]
        },

        academicYears() {
            const students = this.storedStudents ?? []
            if (!students.length) {
                const current = new Date().getFullYear() + 543
                return [{ value: null, label: 'All Years' }, { value: current, label: current.toString() }]
            }
            const years = [...new Set(students.map(s => s.info?.year ? parseInt(s.info.year) : null).filter(Boolean))].sort((a, b) => b - a)
            return [{ value: null, label: 'All Years' }, ...years.map(y => ({ value: y, label: y.toString() }))]
        },

        statuses() {
            return [
                { value: null, label: 'All Status' },
                { value: 'PENDING', label: 'Pending' },
                { value: 'COMPLETE', label: 'Complete' },
                { value: 'FAILED', label: 'Closed' },
            ]
        },

        totalPages() { return Math.ceil(this.programsTable.length / this.itemsPerPage) || 1 },
        tableStartItem() { return this.programsTable.length === 0 ? 0 : (this.activePage - 1) * this.itemsPerPage + 1 },
        tableEndItem() { return Math.min(this.activePage * this.itemsPerPage, this.programsTable.length) },

        isStudentEmailReady() {
            return (this.emailStudent || []).some(t => t.active)
        },
        isAdviserEmailReady() {
            return (this.emailAdviser || []).some(t => t.active)
        },

        studentSentCount() {
            return (this.storedStudents || []).filter(s => s.evaluation).length
        },
        studentPendingCount() {
            return (this.storedStudents || []).length - this.studentSentCount
        },

        adviserSentCount() {
            return (this.storedAdvisors || []).filter(a => a.student && a.student.evaluation).length
        },
        adviserPendingCount() {
            return (this.storedAdvisors || []).length - this.adviserSentCount
        },

        // Adviser Computeds
        advisersTable() {
            const lang = this.$i18n.locale
            let source = this.storedAdvisors || []

            if (this.internalAdviserSchool) {
                source = source.filter(adviser => {
                    const info = adviser.student?.info ?? null
                    return (info?.school?._id ?? info?.school) === this.internalAdviserSchool
                })
            }
            if (this.internalAdviserStatus) {
                source = source.filter(adviser => {
                    const currentStat = adviser.student?.evaluation ? 'COMPLETE' : 'PENDING';
                    return currentStat === this.internalAdviserStatus;
                })
            }
            if (this.internalAdviserSearch.trim()) {
                const q = this.internalAdviserSearch.toLowerCase().trim()
                source = source.filter(adviser => {
                    const advName = (adviser.name || adviser.organizationName || '').toLowerCase()
                    return advName.includes(q) || (adviser.email || '').toLowerCase().includes(q)
                })
            }

            const getTitle = t => (Array.isArray(t) ? (t.find(x => x.key === lang) ?? t[0])?.value ?? 'N/A' : t ?? 'N/A')
            return source.map((item, index) => ({
                _id: item._id,
                organizationName: item.organizationName || item.name || 'N/A',
                organizationAddress: item.organizationAddress || '',
                email: item.email || 'N/A',
                student: item.student?.name ? getTitle(item.student.name) : 'N/A',
                sendStatus: item.student?.evaluation ? 'COMPLETE' : 'PENDING',
            }))
        },

        adviserEmailsData() {
            const lang = this.$i18n.locale
            if (!this.emailAdviser) return []
            return this.emailAdviser.map(item => ({
                _id: item._id,
                title: item.title?.find?.(t => t.key === lang)?.value ?? item.title ?? '',
                description: item.description?.find?.(d => d.key === lang)?.value ?? item.description ?? '',
                templete: item.templete,
                active: item.active,
                updatedAt: this.moment(item.updatedAt).format('DD/MM/YYYY HH:mm'),
            }))
        },

        adviserTotalPages() { return Math.ceil(this.advisersTable.length / this.itemsPerPage) || 1 },
        adviserTableStartItem() { return this.advisersTable.length === 0 ? 0 : (this.adviserActivePage - 1) * this.itemsPerPage + 1 },
        adviserTableEndItem() { return Math.min(this.adviserActivePage * this.itemsPerPage, this.advisersTable.length) },
    },
}
</script>

<style scoped>
.table-card {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    background-color: #ffffff;
    padding-bottom: 8px;
}

::v-deep .custom-table table {
    margin-bottom: 0;
}

::v-deep .custom-table thead th {
    background-color: #ffffff !important;
    color: #9ca3af !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #f3f4f6 !important;
    padding: 16px 24px !important;
    vertical-align: middle;
}

::v-deep .custom-table tbody td {
    color: #374151 !important;
    font-size: 14px;
    font-weight: 500;
    border-top: none !important;
    border-left: none !important;
    border-right: none !important;
    border-bottom: 1px solid #f3f4f6 !important;
    padding: 16px 24px !important;
    vertical-align: middle;
}

::v-deep .custom-table tbody tr:hover td {
    background-color: #f9fafb !important;
}

::v-deep .custom-table tbody tr:last-child td {
    border-bottom: 1px solid #f3f4f6 !important;
}

.status-pill {
    display: inline-flex;
    align-items: center;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 13px;
    font-weight: 600;
}

.status-pending {
    background-color: #fef9c3;
    color: #a16207;
}

.status-replied {
    background-color: #dcfce7;
    color: #166534;
}

.status-closed {
    background-color: #f3f4f6;
    color: #4b5563;
}

.btn-action-icon {
    background-color: transparent !important;
    border: none !important;
    color: #9ca3af !important;
    border-radius: 6px;
    padding: 6px 8px;
    transition: all 0.2s;
    box-shadow: none !important;
}

.btn-action-icon:hover {
    color: #4b5563 !important;
    background-color: #f3f4f6 !important;
}

.btn-action-icon:focus {
    box-shadow: none !important;
}

::v-deep .custom-pagination {
    margin: 0;
}

::v-deep .custom-pagination .page-item .page-link {
    border: 1px solid #f3f4f6;
    color: #6b7280;
    background-color: white;
    margin: 0 2px;
    border-radius: 6px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 32px;
    height: 32px;
    padding: 0 8px;
    font-size: 13px;
    box-shadow: none;
}

::v-deep .custom-pagination .page-item:not(.disabled):hover .page-link {
    background-color: #f9fafb;
    border-color: #e5e7eb;
    color: #374151;
}

::v-deep .custom-pagination .page-item.active .page-link {
    background-color: #ffffff;
    border-color: #d1d5db;
    color: #111827;
    font-weight: 600;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

::v-deep .custom-pagination .page-item.disabled .page-link {
    color: #d1d5db;
    background-color: #ffffff;
    border-color: #f3f4f6;
}

.filter-card {
    border-radius: 8px;
    border: 1px solid #e5e7eb;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
    background-color: #ffffff;
}

::v-deep .custom-tabs .nav-tabs {
    border-bottom: 2px solid #e5e7eb;
    margin-bottom: 1rem;
}

::v-deep .custom-tabs .nav-link {
    color: #6b7280;
    font-weight: 600;
    border: none;
    padding: 0.75rem 1.5rem;
    margin-bottom: -2px;
}

::v-deep .custom-tabs .nav-link.active {
    color: #db2777;
    background: transparent;
    border-bottom: 2px solid #db2777;
}

::v-deep .custom-tabs .nav-link:hover:not(.active) {
    color: #374151;
    border-bottom: 2px solid #d1d5db;
}

.custom-template-table thead th {
    background-color: #f8fafc !important;
    color: #64748b !important;
    font-size: 11px !important;
    font-weight: 700 !important;
    text-transform: uppercase !important;
    letter-spacing: 0.05em;
    border-top: 1px solid #f1f5f9 !important;
    border-bottom: 1px solid #f1f5f9 !important;
    padding: 12px 16px !important;
    vertical-align: middle;
}

.custom-template-table tbody td {
    padding: 20px 16px !important;
    border-bottom: 1px solid #f1f5f9 !important;
    vertical-align: middle;
}

.custom-template-table tbody tr:hover td {
    background-color: #f8fafc !important;
}

.cursor-pointer {
    cursor: pointer;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    color: #9ca3af;
    width: 16px;
    height: 16px;
}

.search-input {
    padding-left: 36px !important;
    border-radius: 6px;
    background-color: #f9fafb;
    border: 1px solid #f3f4f6;
    color: #4b5563;
    font-size: 14px;
}

.search-input:focus {
    background-color: #ffffff;
    border-color: #d1d5db;
    box-shadow: 0 0 0 2px rgba(229, 231, 235, 0.5);
}

.btn-filter-action {
    background-color: #ffffff;
    border: 1px solid #e5e7eb;
    color: #4b5563;
    border-radius: 6px;
    font-weight: 600;
    font-size: 14px;
    padding: 6px 16px;
    display: inline-flex;
    align-items: center;
}

.btn-filter-action:hover {
    background-color: #f9fafb;
    color: #111827;
}

.btn-filter-red {
    background-color: #fef2f2;
    border-color: #fecaca;
    color: #dc2626;
}

.btn-filter-red:hover {
    background-color: #fee2e2;
    color: #b91c1c;
}

.filter-divider {
    border-top: 1px solid #f3f4f6;
    margin: 0 -1rem 1rem -1rem;
}

.filter-label {
    font-size: 11px;
    font-weight: 700;
    color: #6b7280;
    letter-spacing: 0.05em;
    margin-bottom: 6px;
    text-transform: uppercase;
}

.custom-select-ui select {
    background-color: #f9fafb !important;
    border: 1px solid #f3f4f6 !important;
    border-radius: 6px !important;
    color: #4b5563 !important;
    font-size: 14px !important;
}

.custom-select-ui select:focus {
    background-color: #ffffff !important;
    border-color: #d1d5db !important;
    box-shadow: none !important;
}

.slide-enter-active,
.slide-leave-active {
    transition: all 0.3s ease-in-out;
    max-height: 200px;
    opacity: 1;
    overflow: hidden;
}

.slide-enter,
.slide-leave-to {
    max-height: 0;
    opacity: 0;
    margin-top: 0;
    padding-top: 0;
    padding-bottom: 0;
}
.modern-select-filter {
    border-radius: 10px !important;
    border: 1.5px solid #f1f5f9 !important;
    background-color: #ffffff !important;
    height: 42px !important;
    font-size: 13px !important;
    font-weight: 600;
}

.search-input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.search-icon {
    position: absolute;
    left: 12px;
    color: #9ca3af;
    width: 16px;
    height: 16px;
    z-index: 10;
}

.search-input {
    padding-left: 36px !important;
    height: 42px !important;
    border-radius: 10px !important;
    background-color: #ffffff !important;
    border: 1.5px solid #f1f5f9 !important;
    color: #4b5563;
    font-size: 14px;
}

.search-input:focus {
    border-color: #cbd5e1 !important;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03) !important;
}

.modern-action-btn {
    border-radius: 8px !important;
    font-weight: 700 !important;
    font-size: 12px !important;
    padding: 8px 14px !important;
    text-transform: uppercase;
    letter-spacing: 0.02em;
}

.modern-filter-bar {
    background-color: #f8fafc !important; /* Light Gray */
    border-top-color: #f1f5f9 !important;
    border-bottom-color: #f1f5f9 !important;
}

.detail-label {
    font-size: 11px;
    font-weight: 800;
    color: #94a3b8;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 4px;
}

.detail-value {
    font-size: 15px;
    color: #1e293b;
}

.border-dashed {
    border-style: dashed !important;
}
</style>
