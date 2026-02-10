<template>
    <CCard>
        <CCardBody>
            <CRow>
                <CCol sm="8">
                    <h4 class="card-title mb-0">Line Chart for the Number of Student Logins and File Download per Week
                    </h4>
                </CCol>
                <CCol sm="4" class="d-none d-md-block">
                    <!-- Optional controls -->
                </CCol>
            </CRow>
            <div style="height: 400px; margin-top: 20px;">
                <CChartLine :datasets="datasets" :options="options" :labels="labels" />
            </div>
            <div class="text-center mt-3">
                <CButtonGroup>
                    <CButton color="outline-secondary" class="mx-0" style="width: 120px;">Daily</CButton>
                    <CButton color="danger" class="mx-0" style="width: 120px;">Weekly</CButton>
                    <CButton color="outline-secondary" class="mx-0" style="width: 120px;">Monthly</CButton>
                </CButtonGroup>
            </div>
        </CCardBody>
    </CCard>
</template>

<script>
import { CChartLine } from '@coreui/vue-chartjs'
import { getStyle, hexToRgba } from '@coreui/utils/src'

export default {
    name: 'CChartLineWrapper',
    components: {
        CChartLine
    },
    data() {
        return {
            labels: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
            datasets: [
                {
                    label: 'No. of Logins',
                    backgroundColor: 'transparent',
                    borderColor: '#868bf6',
                    pointBackgroundColor: '#868bf6',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#868bf6',
                    pointHoverBorderColor: '#868bf6',
                    data: [0, 1800, 1100, 3000, 1000, 500, 600, 1000], // Approximate from image
                    borderWidth: 2
                },
                {
                    label: 'No. of Downloads',
                    backgroundColor: 'transparent',
                    borderColor: '#f69790',
                    pointBackgroundColor: '#f69790',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#f69790',
                    pointHoverBorderColor: '#f69790',
                    data: [0, 800, 2300, 600, 150, 900, 2200, 200], // Approximate from image
                    borderWidth: 2
                }
            ],
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        usePointStyle: true,
                        boxWidth: 8
                    }
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            drawOnChartArea: true,
                            borderDash: [3, 3],
                            color: '#d9d9d9' // Lighter grid for X
                        },
                        ticks: {
                            maxRotation: 0
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            maxTicksLimit: 5,
                            stepSize: 1000,
                            max: 4000
                        },
                        gridLines: {
                            display: true,
                            borderDash: [3, 3],
                            color: '#d9d9d9'
                        }
                    }]
                },
                elements: {
                    point: {
                        radius: 3,
                        hitRadius: 10,
                        hoverRadius: 4,
                        hoverBorderWidth: 3
                    },
                    line: {
                        tension: 0 // Straight lines between points if needed, but image shows straight segments? No, slight usage, default is fine or 0.
                        // Logic check: User image shows straight line segments? The lines look straight between points. So tension: 0.
                    }
                }
            }
        }
    }
}
</script>
