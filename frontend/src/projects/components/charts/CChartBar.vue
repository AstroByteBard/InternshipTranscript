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
    props: {
        labels: {
            type: Array,
            default: () => []
        },
        datasets: {
            type: Array,
            default: () => []
        }
    },
    computed: {
        maxCount() {
            if (!this.datasets || !this.datasets[0] || !this.datasets[0].data.length) return 100;
            const max = Math.max(...this.datasets[0].data);
            return Math.ceil(max / 10) * 10 || 10;
        },
        options() {
            return {
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
                            max: this.maxCount,
                            min: 0,
                            stepSize: Math.ceil(this.maxCount / 4) || 1,
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
