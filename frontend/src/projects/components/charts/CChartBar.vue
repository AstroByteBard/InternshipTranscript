<template>
    <div>
        <CCard>
            <CCardBody>
                <CRow>
                    <CCol sm="8">
                        <h4 id="traffic" class="card-title mb-0">Bar Chart for the Count of Students' Internships
                            Evaluated or
                            Not
                            Evaluated</h4>
                    </CCol>
                    <CCol sm="4" class="d-none d-md-block">
                        <!-- Optional: Buttons or other controls can go here -->
                    </CCol>
                </CRow>
                <div>
                    <CChartBar :datasets="datasets" :options="options" :labels="labels" />
                </div>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
import { CChartBar } from '@coreui/vue-chartjs'

export default {
    name: 'ChartBar',
    components: {
        CChartBar
    },
    data() {
        return {
            labels: [
                'Argo Industry', 'Anti-Aging', 'Cosmetic Science', 'Dentistry', 'Health Science',
                'Law', 'Liberal Arts', 'Management', 'Medicine', 'Nursing', 'Science',
                'Applied Digital Technology', 'Integrative Medicine', 'Sinology'
            ],
            datasets: [
                {
                    label: 'Evaluated',
                    backgroundColor: '#9da5ee',
                    hoverBackgroundColor: '#8c95e0',
                    data: [280, 200, 400, 360, 600, 200, 360, 200, 600, 400, 200, 360, 200, 280],
                    barPercentage: 0.5,
                    categoryPercentage: 1.0
                },
                {
                    label: 'Not Evaluated',
                    backgroundColor: '#f8b1aa',
                    hoverBackgroundColor: '#e69088',
                    data: [100, 200, 100, 100, 100, 100, 100, 100, 100, 100, 200, 100, 100, 100],
                    barPercentage: 0.5,
                    categoryPercentage: 1.0
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
                        boxWidth: 10
                    }
                },
                scales: {
                    xAxes: [{
                        stacked: true,
                        gridLines: {
                            display: true,
                            borderDash: [3, 3],
                            color: '#bfbfbf'
                        },
                        ticks: {
                            autoSkip: false,
                            fontSize: 10,
                            maxRotation: 0
                        }
                    }],
                    yAxes: [{
                        stacked: true,
                        ticks: {
                            beginAtZero: true,
                            max: 800,
                            stepSize: 100
                        },
                        gridLines: {
                            display: true,
                            borderDash: [3, 3],
                            color: '#d9d9d9',
                            zeroLineColor: '#d9d9d9'
                        }
                    }]
                },
                tooltips: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    }
}
</script>
