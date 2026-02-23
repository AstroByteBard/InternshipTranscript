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
                            68%</div>
                        <div class="font-weight-bold" style="font-size: 0.85rem; color: #4b5563;">Completed</div>
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
    data() {
        return {
            labels: ['Completed', 'Not Completed'],
            datasets: [
                {
                    backgroundColor: ['#b0352d', '#f8d2d2'], // Match bar chart tone
                    data: [68, 32],
                    borderWidth: 0,
                    hoverBorderWidth: 0
                }
            ],
            options: {
                maintainAspectRatio: false,
                cutoutPercentage: 85, // Makes it a thin doughnut
                legend: {
                    display: false // Hide legend
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
