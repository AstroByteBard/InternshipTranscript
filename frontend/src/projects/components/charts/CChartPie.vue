<template>
    <div>
        <CCard class="rounded shadow-sm mb-4" style="border: 1px solid #e5e7eb;">
            <CCardBody class="p-4">
                <CRow class="mb-4">
                    <CCol sm="12">
                        <h4 class="card-title mb-1" style="font-weight: bold; color: #111827; font-size: 1.25rem;">
                            Evaluation Status</h4>
                        <div class="small text-muted" style="font-size: 0.9rem; color: #6b7280;">Completion ratio</div>
                    </CCol>
                </CRow>
                <div class="position-relative d-flex justify-content-center align-items-center"
                    style="height: 400px; margin-top: 10px;">
                    <CChartPie :datasets="datasets" :options="options" :labels="labels"
                        style="height: 100%; width: 100%;" />
                    <!-- Center Text Overlay -->
                    <div class="position-absolute text-center d-flex flex-column justify-content-center align-items-center"
                        style="pointer-events: none;">
                        <div class="font-weight-bold mb-0" style="color: #111827; font-size: 2.5rem; line-height: 1.2;">
                            {{ percentage }}%</div>
                        <div class="font-weight-bold" style="font-size: 0.85rem; color: #4b5563;">{{ labels[0] }}</div>
                    </div>
                </div>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
import { CChartPie } from '@coreui/vue-chartjs'

export default {
    name: 'ChartPie',
    components: { CChartPie },
    props: {
        labels: {
            type: Array,
            default: () => ['Completed', 'Not Completed']
        },
        datasets: {
            type: Array,
            default: () => [
                {
                    backgroundColor: ['#b0352d', '#f8d2d2'],
                    data: [0, 0],
                    borderWidth: 0,
                    hoverBorderWidth: 0
                }
            ]
        }
    },
    computed: {
        percentage() {
            if (!this.datasets || !this.datasets[0] || !this.datasets[0].data) return 0;
            const data = this.datasets[0].data;
            const total = data.reduce((a, b) => a + b, 0);
            if (total === 0) return 0;
            return Math.round((data[0] / total) * 100);
        },
        options() {
            return {
                maintainAspectRatio: false,
                cutoutPercentage: 85,
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: true
                }
            }
        }
    }
}
</script>

<style scoped>
/* Custom styles if needed */
</style>
