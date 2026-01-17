<template>
  <CChartBar
    :datasets="defaultDatasets"
    :options="defaultOptions"
    :labels="['Liberal Arts', 'Science', 'Management', 'Applied Digital Technology', 'Agro-Industry', 'Law']"
  />
</template>

<script>
import { CChartBar } from '@coreui/vue-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils/src'

function random (min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export default {
  name: 'MainChartExample',
  components: {
    CChartBar
  },
  computed: {
    defaultDatasets () {
      const brandSuccess = getStyle('success') || '#4dbd74'
      const brandDanger = getStyle('danger') || '#f86c6b'

      let elements = 6
      const data1 = []
      const data2 = []

      for (let i = 0; i <= elements; i++) {
        data1.push(random(500, 3000))
        data2.push(random(200, 2000))
      }
      return [
        {
          label: 'Evaluated',
          backgroundColor: hexToRgba(brandSuccess, 10),
          borderColor: brandSuccess,
          pointHoverBackgroundColor: brandSuccess,
          borderWidth: 2,
          data: data1
        },
        {
          label: 'Not Evaluated',
          backgroundColor: 'transparent',
          borderColor: brandDanger,
          pointHoverBackgroundColor: brandDanger,
          borderWidth: 2,
          data: data2
        }
      ]
    },
    defaultOptions () {
      return {

        maintainAspectRatio: false,
        legend: {
          display: false
        },
        scales: {
          xAxes: [{
            gridLines: {
              drawOnChartArea: false
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero: true,
              maxTicksLimit: 5,
              stepSize: Math.ceil(250 / 5),
              max: 4000
            },
            gridLines: {
              display: true
            }
          }]
        },
        elements: {
          point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
            hoverBorderWidth: 3
          }
        }
      }
    }
  }
}
</script>
