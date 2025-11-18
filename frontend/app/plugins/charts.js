import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, BarElement, PointElement, CategoryScale, LinearScale, ArcElement } from 'chart.js'

export default defineNuxtPlugin(() => {
    ChartJS.register(
    Title,
    Tooltip,
    Legend,
    LineElement,
    BarElement,
    PointElement,
    CategoryScale,
    LinearScale,
    ArcElement
    )
})