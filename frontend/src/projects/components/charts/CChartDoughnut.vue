<template>
    <div class="position-relative d-flex justify-content-center align-items-center" style="height: 100%;">
        <CChartDoughnut 
            :datasets="datasets" 
            :options="computedOptions" 
            :labels="labels"
            style="height: 100%; width: 100%;" 
        />
        <!-- Center Text Overlay -->
        <div class="position-absolute text-center d-flex flex-column justify-content-center align-items-center"
            style="pointer-events: none;">
            <div class="font-weight-bold mb-0" style="color: #1e293b; font-size: 2rem; line-height: 1.2;">
                {{ percentage }}%</div>
            <div class="font-weight-bold text-uppercase" style="font-size: 0.75rem; color: #64748b; letter-spacing: 0.05em;">
                {{ labels[0] }}
            </div>
        </div>
    </div>
</template>

<script>
import { CChartDoughnut } from '@coreui/vue-chartjs'

export default {
    name: 'ChartDoughnut',
    components: { CChartDoughnut },
    props: {
        labels: {
            type: Array,
            default: () => ['Completed', 'Pending']
        },
        datasets: {
            type: Array,
            default: () => []
        },
        options: {
            type: Object,
            default: () => null
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
        computedOptions() {
            if (this.options) return this.options;

            return {
                maintainAspectRatio: false,
                cutoutPercentage: 80,
                legend: {
                    display: false
                },
                tooltips: {
                    enabled: true,
                    backgroundColor: '#ffffff',
                    titleFontColor: '#1e293b',
                    bodyFontColor: '#64748b',
                    borderColor: '#f1f5f9',
                    borderWidth: 1,
                    cornerRadius: 8,
                    xPadding: 10,
                    yPadding: 10,
                    displayColors: true
                }
            }
        }
    }
}
</script>
