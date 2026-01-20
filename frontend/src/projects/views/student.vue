<template>
  <div>
    <WidgetsDropdown />
    <CRow>
      <CCol sm="12">
        <CCard>
          <CCardHeader>
            <div class="card-header-actions">
              <CButton color="primary" size="sm" @click="showImportModal = true">
                <CIcon name="cil-user-follow"/> Import Students
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
        <CTableWrapper
          :items="getShuffledUsersData()"
          hover
          striped
          bordered
          small
          fixed
          caption="StudentTable"
        />
        </CCardBody>
        </CCard>
      </CCol>
    </CRow>

    <!-- Import Modal -->
    <ImportStudentModal 
      :show.sync="showImportModal"
      @import="onImportFile"
    />
  </div>
</template>

<script>
import CTableWrapper from './tables/Table.vue'
import usersData from '../../views/users/UsersData'
import ImportStudentModal from '../../views/Import/ImportStudentModal.vue'

export default {
  name: 'student',
  components: {
    CTableWrapper, 
    ImportStudentModal
  },
  data() {
    return {

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
    onInit() {},
    shuffleArray (array) {
      for (let i = array.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1))
        let temp = array[i]
        array[i] = array[j]
        array[j] = temp
      }
      return array
    },
    getShuffledUsersData () {
      return this.shuffleArray(usersData.slice(0))
    }
  },

  computed: {

  },

  watch: {

  }
}

</script>