<template>
  <div>
    <WidgetsDropdown />
    <CChartBar />
    <CChartPie />
    <CChartLine />
  </div>
</template>

<script>
import WidgetsDropdown from '../components/widgets/WidgetsDropdown.vue'
import CChartBar from '../components/charts/CChartBar'
import CChartPie from '../components/charts/CChartPie'
import CChartLine from '../components/charts/CChartLine'

export default {
  name: 'Dashboard',
  components: {
    WidgetsDropdown,
    CChartBar,
    CChartPie,
    CChartLine
  },
  data() {
    return {

    }
  },
  mounted() {
    // Logic to fetch dynamic data could be added here
    // this.onInit() 
  },
  methods: {
    onInit() {
      // this.$store.dispatch("academic/school") 
    }
  }
}
</script>
