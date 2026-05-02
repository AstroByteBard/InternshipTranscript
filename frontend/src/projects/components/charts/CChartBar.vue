<template>
    <div style="height: 100%;">
        <CChartHorizontalBar 
            :datasets="datasets" 
            :options="computedOptions" 
            :labels="labels" 
            style="height: 100%;" 
        />
    </div>
</template>

<script>
import { CChartHorizontalBar } from '@coreui/vue-chartjs'

export default {
    name: 'ChartBar',
    components: {
        CChartHorizontalBar
    },
    props: {
        labels: {
            type: Array,
            default: () => []
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
        maxCount() {
            if (!this.datasets || !this.datasets[0] || !this.datasets[0].data.length) return 100;
            const max = Math.max(...this.datasets[0].data);
            return Math.ceil(max / 10) * 10 || 10;
        },
        computedOptions() {
            if (this.options) return this.options;

            return {
                maintainAspectRatio: false,
                legend: { display: false },
                scales: {
                    xAxes: [{
                        ticks: {
                            beginAtZero: true,
                            max: this.maxCount,
                            fontColor: '#4b5563',
                            fontSize: 12
                        },
                        gridLines: {
                            color: '#f3f4f6',
                            zeroLineColor: '#f3f4f6',
                            drawBorder: false
                        }
                    }],
                    yAxes: [{
                        gridLines: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            fontColor: '#1f2937',
                            fontSize: 12,
                            fontStyle: '600'
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
