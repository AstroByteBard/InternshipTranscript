<template>
    <div>
        <CCard class="rounded shadow-sm mb-4" style="border: 1px solid #e5e7eb;">
            <CCardBody class="p-4">
                <CRow class="mb-4">
                    <CCol sm="12">
                        <h4 id="traffic" class="card-title mb-1"
                            style="font-weight: bold; color: #111827; font-size: 1.25rem;">Performance Overview</h4>
                        <div class="small text-muted" style="font-size: 0.9rem; color: #6b7280;">Evaluation metrics by
                            school</div>
                    </CCol>
                </CRow>
                <div style="height: 400px; margin-top: 10px;">
                    <CChartBar :datasets="datasets" :options="options" :labels="labels" style="height: 100%;" />
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
                'Engineering', 'Business', 'Arts', 'Science', 'Medicine',
                'Law', 'Education', 'Tech', 'Arch', 'Nursing',
                'Music', 'Psych', 'Comm', 'Social'
            ],
            datasets: [
                {
                    label: 'Metrics',
                    backgroundColor: '#c83f36',
                    hoverBackgroundColor: '#b0352d',
                    data: [4000, 3500, 2000, 2800, 1900, 2400, 3500, 3200, 2100, 2800, 1500, 2600, 2900, 3100],
                    barPercentage: 0.6,
                    categoryPercentage: 1.0
                }
            ],
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scales: {
                    xAxes: [{
                        gridLines: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            autoSkip: false,
                            fontSize: 11,
                            fontColor: '#9ca3af',
                            maxRotation: 45,
                            minRotation: 45,
                            padding: 10
                        }
                    }],
                    yAxes: [{
                        ticks: {
                            beginAtZero: true,
                            max: 4000,
                            min: 0,
                            stepSize: 1000,
                            fontColor: '#9ca3af',
                            padding: 15
                        },
                        gridLines: {
                            display: true,
                            borderDash: [5, 5],
                            color: '#f3f4f6',
                            zeroLineColor: '#f3f4f6',
                            drawBorder: false
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
