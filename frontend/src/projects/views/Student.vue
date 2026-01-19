<template>
  <div>
    <WidgetsDropdown />
    <CRow>
      <CCol sm="12">
        <CTableWrapper
          :items="getShuffledUsersData()"
          hover
          striped
          bordered
          small
          fixed
          caption="StudentTable"
        />
      </CCol>
    </CRow>
  </div>
</template>

<script>
import CTableWrapper from './tables/Table.vue'
import usersData from '../../views/users/UsersData'

export default {
  name: 'student',
  components: {
    CTableWrapper
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