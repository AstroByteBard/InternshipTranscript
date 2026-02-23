<template>
    <div>
        <CRow>
            <CCol>
                <CCard class="mb-4">
                    <CCardHeader>
                        <h4 class="mb-0">Form Form</h4>
                    </CCardHeader>
                    <CCardBody>
                        <CRow>
                            <CCol sm="12">
                                <CForm>
                                    <CInput label="Name" type="text" placeholder="Enter name" />
                                    <CSelect label="Type" :options="['Option 1', 'Option 2', 'Option 3']"
                                        placeholder="Please select" />
                                    <CTextarea label="Description" placeholder="Enter description..." rows="4" />
                                    <CButton color="primary" class="mt-3 px-4">Save</CButton>
                                </CForm>
                            </CCol>
                        </CRow>
                    </CCardBody>
                </CCard>
            </CCol>
        </CRow>
    </div>
</template>

<script>
export default {
    name: 'AdministrationForm',
    data() {
        return {

        }
    }
}
</script>

<style scoped></style>
