<template>
    <div>
        <CCard>
            <CCardBody>
                <CRow>
                    <CCol sm="10">
                        <h4 class="card-title">Pie Chart for the Count of Students' Internships Evaluated or Not
                            Evaluated</h4>
                    </CCol>
                    <CCol sm="2" class="text-right">
                        <span class="text-muted">Unit: 4000</span>
                    </CCol>
                </CRow>
                <div>
                    <CChartPie :datasets="datasets" :options="options" :labels="labels" />
                </div>
            </CCardBody>
        </CCard>
    </div>
</template>

<script>
import { CChartPie } from '@coreui/vue-chartjs'

export default {
    name: 'ChartPie',
    components: {
        CChartPie
    },
    data() {
        return {
            labels: ['Evaluated', 'Not Evaluated'],
            datasets: [
                {
                    backgroundColor: ['#868bf6', '#f69790'],
                    data: [2500, 1500]
                }
            ],
            options: {
                maintainAspectRatio: false,
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        usePointStyle: true,
                        padding: 20
                    }
                },
                tooltips: {
                    callbacks: {
                        label: function (tooltipItem, data) {
                            var dataset = data.datasets[tooltipItem.datasetIndex];
                            var total = dataset.data.reduce(function (previousValue, currentValue) {
                                return previousValue + currentValue;
                            });
                            var currentValue = dataset.data[tooltipItem.index];
                            var percentage = Math.floor(((currentValue / total) * 100) + 0.5);
                            return data.labels[tooltipItem.index] + ': ' + currentValue + ' (' + percentage + '%)';
                        }
                    }
                }
            }
        }
    }
}
</script>
