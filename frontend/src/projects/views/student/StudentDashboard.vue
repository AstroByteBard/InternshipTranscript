<template>
    <div class="student-dashboard">
        <div class="dashboard-header">
            <div class="header-title">
                <h1>Dashboard</h1>
                <p class="subtitle">Overview of student evaluations and system activity</p>
            </div>
            <button class="btn-download-pdf" @click="openDownloadModal">
                <i class="fas fa-download"></i> Download PDF
            </button>
        </div>

        <CModal :show.sync="showDownloadModal" :centered="true">
            <div class="modal-header">
                <h5 class="modal-title">Download PDF</h5>
                <button type="button" class="close" @click="showDownloadModal = false">&times;</button>
            </div>
            <div class="modal-body">
                <label class="modal-label">Select Document<span class="text-danger">*</span></label>
                <CSelect class="custom-select-ui" :options="publicDocumentOptions" :value.sync="selectedDocumentId"
                    placeholder="Select Document" />
                <div v-if="!publicDocumentOptions.length" class="text-muted small mt-2">
                    No public documents available.
                </div>
            </div>
            <div class="modal-footer">
                <CButton color="secondary" variant="ghost" @click="showDownloadModal = false">Cancel</CButton>
                <CButton color="danger" :disabled="!selectedDocumentId" @click="handleDownload">
                    Download
                </CButton>
            </div>
        </CModal>

        <!-- Student Info Card -->
        <div class="student-info-card">
            <div class="student-profile">
                <img :src="studentData.picture" :alt="studentData.name" class="student-avatar">
                <div class="student-details">
                    <h2>{{ studentData.name }}</h2>
                    <p class="student-id">Student ID: {{ studentData.studentID }}</p>
                    <p class="student-school">{{ studentData.school }} - {{ studentData.program }}</p>
                </div>
            </div>
        </div>

        <!-- Competencies Section -->
        <div class="competencies-section">
            <!-- Specific Competencies -->
            <div class="competency-category">
                <h3>Specific Competencies</h3>
                <div class="competency-list">
                    <div v-for="skill in specificCompetencies" :key="skill.id" class="competency-item">
                        <div class="competency-header">
                            <span class="skill-name">{{ skill.name }}</span>
                            <span class="skill-percentage">{{ skill.percentage }}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: skill.percentage + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- General Competencies -->
            <div class="competency-category">
                <h3>General Competencies</h3>
                <div class="competency-list">
                    <div v-for="skill in generalCompetencies" :key="skill.id" class="competency-item">
                        <div class="competency-header">
                            <span class="skill-name">{{ skill.name }}</span>
                            <span class="skill-percentage">{{ skill.percentage }}%</span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" :style="{ width: skill.percentage + '%' }"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Charts Section -->
        <div class="charts-section">
            <div class="chart-container">
                <h4>Specific Competencies Comparison</h4>
                <CChartRadar :datasets="specificChartDatasets" :labels="specificChartLabels" :options="chartOptions" />
                <div class="chart-legend">
                    <span class="legend-item"><span class="legend-color" style="background-color: #E8A0BF;"></span>
                        You</span>
                    <span class="legend-item"><span class="legend-color" style="background-color: #C9B1E0;"></span>
                        Average</span>
                </div>
            </div>
            <div class="chart-container">
                <h4>General Competencies Comparison</h4>
                <CChartRadar :datasets="generalChartDatasets" :labels="generalChartLabels" :options="chartOptions" />
                <div class="chart-legend">
                    <span class="legend-item"><span class="legend-color" style="background-color: #E8A0BF;"></span>
                        You</span>
                    <span class="legend-item"><span class="legend-color" style="background-color: #C9B1E0;"></span>
                        Average</span>
                </div>
            </div>
        </div>

        <!-- Feedback Section -->
        <div class="feedback-section">
            <!-- Outstanding -->
            <div class="feedback-category">
                <h3>Outstanding</h3>
                <div v-for="feedback in Outstanding" :key="feedback.id" class="feedback-item">
                    <div class="feedback-header">
                        <div class="feedback-profile">
                            <img :src="feedback.picture" :alt="feedback.name" class="feedback-avatar">
                            <div class="feedback-author">
                                <h4>{{ feedback.name }}</h4>
                                <p class="feedback-role">{{ feedback.role }}</p>
                            </div>
                        </div>
                        <span class="feedback-date">{{ feedback.date }}</span>
                    </div>
                    <div class="feedback-content">
                        <ul>
                            <li v-for="(point, index) in feedback.points" :key="index">{{ point }}</li>
                        </ul>
                    </div>
                </div>
            </div>

            <!-- Opportunities -->
            <div class="feedback-category">
                <h3>Opportunities</h3>
                <div v-for="feedback in Opportunities" :key="feedback.id" class="feedback-item">
                    <div class="feedback-header">
                        <div class="feedback-profile">
                            <img :src="feedback.picture" :alt="feedback.name" class="feedback-avatar">
                            <div class="feedback-author">
                                <h4>{{ feedback.name }}</h4>
                                <p class="feedback-role">{{ feedback.role }}</p>
                            </div>
                        </div>
                        <span class="feedback-date">{{ feedback.date }}</span>
                    </div>
                    <div class="feedback-content">
                        <ul>
                            <li v-for="(point, index) in feedback.points" :key="index">{{ point }}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapGetters } from 'vuex';
import { CChartRadar } from '@coreui/vue-chartjs';
import { downloadClientPDF } from '@/utils/pdfGenerator';

export default {
    name: 'StudentDashboard',
    components: {
        CChartRadar
    },
    data() {
        return {
            studentData: {
                name: '',
                studentID: '',
                school: '',
                program: '',
                picture: require('@/assets/avatars/3.jpg')
            },
            showDownloadModal: false,
            publicDocuments: [],
            selectedDocumentId: '',
            specificCompetencies: [
                // loaded from API
            ],
            generalCompetencies: [
                // loaded from API
            ],
            Outstanding: [
                // loaded from API
            ],
            Opportunities: [
                // loaded from API
            ],
            specificChartLabels: [
                // loaded from API
            ],
            specificChartDatasets: [
                // loaded from API
            ],
            generalChartLabels: [
                // loaded from API
            ],
            generalChartDatasets: [
                // loaded from API
            ],
            chartOptions: {
                responsive: true,
                maintainAspectRatio: false,
                legend: {
                    display: false
                },
                scale: {
                    ticks: {
                        beginAtZero: true,
                        max: 100,
                        stepSize: 20,
                        fontSize: 11
                    }
                }
            }
        };
    },
    async mounted() {
        await this.ensureAuthUser();
        await this.loadStudentData();
        await this.loadEvaluationData();
    },
    methods: {
        async ensureAuthUser() {
            if (!this.$store?.state?.auth?.user) {
                try {
                    await this.$store.dispatch('auth/restoreAuth');
                } catch (err) {
                    console.error('Failed to restore auth', err);
                }
            }

            if (!this.$store?.state?.auth?.user) {
                try {
                    const userStr = localStorage.getItem('auth_user');
                    if (userStr) {
                        this.$store.commit('auth/setUser', JSON.parse(userStr));
                    }
                } catch (err) {
                    console.error('Failed to parse auth_user', err);
                }
            }
        },
        normalizeScoreToPercent(score) {
            const num = Number(score);
            if (!Number.isFinite(num)) return 0;
            if (num <= 1) return Math.round(num * 100);
            if (num <= 5) return Math.round((num / 5) * 100);
            if (num <= 10) return Math.round((num / 10) * 100);
            if (num <= 100) return Math.round(num);
            return 100;
        },
        mapEvaluationList(list) {
            if (!Array.isArray(list)) return [];
            return list.map((item, index) => ({
                id: index + 1,
                name: String(item?.answer?.title?.en || item?.answer?.title?.th || item?.criteriaId || 'Criteria'),
                percentage: this.normalizeScoreToPercent(item?.answer?.score ?? item?.score)
            }));
        },
        mapSuggestionList(list) {
            if (!Array.isArray(list)) return [];
            const points = list
                .map(item => item?.answer?.value)
                .filter(Boolean);
            if (!points.length) return [];
            return [
                {
                    id: 1,
                    name: this.studentData.name || 'Student',
                    role: 'Student',
                    picture: this.studentData.picture,
                    date: '',
                    points
                }
            ];
        },
        updateChartsFromCompetencies() {
            const specificLabels = this.specificCompetencies.map(s => s.name);
            const specificData = this.specificCompetencies.map(s => s.percentage);
            const generalLabels = this.generalCompetencies.map(s => s.name);
            const generalData = this.generalCompetencies.map(s => s.percentage);

            this.specificChartLabels = specificLabels;
            this.generalChartLabels = generalLabels;
            this.specificChartDatasets = [
                {
                    label: 'You',
                    data: specificData,
                    borderColor: '#E8A0BF',
                    backgroundColor: 'rgba(232, 160, 191, 0.2)',
                    pointBackgroundColor: '#E8A0BF',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#E8A0BF'
                },
                {
                    label: 'Average',
                    data: new Array(specificData.length).fill(0),
                    borderColor: '#C9B1E0',
                    backgroundColor: 'rgba(201, 177, 224, 0.2)',
                    pointBackgroundColor: '#C9B1E0',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#C9B1E0'
                }
            ];
            this.generalChartDatasets = [
                {
                    label: 'You',
                    data: generalData,
                    borderColor: '#E8A0BF',
                    backgroundColor: 'rgba(232, 160, 191, 0.2)',
                    pointBackgroundColor: '#E8A0BF',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#E8A0BF'
                },
                {
                    label: 'Average',
                    data: new Array(generalData.length).fill(0),
                    borderColor: '#C9B1E0',
                    backgroundColor: 'rgba(201, 177, 224, 0.2)',
                    pointBackgroundColor: '#C9B1E0',
                    pointBorderColor: '#ffffff',
                    pointHoverBackgroundColor: '#ffffff',
                    pointHoverBorderColor: '#C9B1E0'
                }
            ];
        },
        async loadEvaluationData() {
            try {
                const authUser = this.$store?.state?.auth?.user;
                const email = authUser?.email || (() => {
                    try {
                        const userStr = localStorage.getItem('auth_user');
                        return userStr ? JSON.parse(userStr)?.email : '';
                    } catch (err) {
                        return '';
                    }
                })();
                if (!email) return;

                const students = this.storedStudents || [];
                const student = students.find(s => s?.email === email);
                if (!student || !student._id) {
                    console.warn('Evaluation load: student not found for email', email);
                    return;
                }

                await this.$store.dispatch('competencies/evaluation/evaluations', { studentId: student._id });
                const evalPayload = this.storedEvaluations || [];
                const evalData = Array.isArray(evalPayload)
                    ? evalPayload.find(e => String(e?.studentId?._id || e?.studentId) === String(student._id))
                    : evalPayload;
                if (!evalData) return;

                const softskills = Array.isArray(evalData) ? evalData[0]?.softskills : evalData.softskills;
                const hardskills = Array.isArray(evalData) ? evalData[0]?.hardskills : evalData.hardskills;
                const suggestions = Array.isArray(evalData)
                    ? (evalData[0]?.suggestions || evalData[0]?.sugestion)
                    : (evalData.suggestions || evalData.sugestion);

                const general = this.mapEvaluationList(softskills);
                const specific = this.mapEvaluationList(hardskills);
                const suggestionList = this.mapSuggestionList(suggestions);

                if (general.length) this.generalCompetencies = general;
                if (specific.length) this.specificCompetencies = specific;
                if (suggestionList.length) {
                    this.Outstanding = suggestionList;
                    this.Opportunities = [];
                }
                this.updateChartsFromCompetencies();
            } catch (err) {
                console.error('Failed to load evaluation data', err);
            }
        },
        async loadStudentData() {
            // Load student data from Vuex store and hydrate from DB by email
            if (this.$store.state.auth && this.$store.state.auth.user) {
                const user = this.$store.state.auth.user;
                const email = user?.email || (() => {
                    try {
                        const userStr = localStorage.getItem('auth_user');
                        return userStr ? JSON.parse(userStr)?.email : '';
                    } catch (err) {
                        return '';
                    }
                })();
                this.studentData = {
                    ...this.studentData,
                    name: user.name || user.email || this.studentData.name,
                    studentID: user.studentID || this.studentData.studentID,
                    picture: user.picture || this.studentData.picture
                };

                // Ensure students are loaded into store
                await this.$store.dispatch('member/students/students');

                if (email) {
                    try {
                        const students = this.storedStudents || [];
                        const student = students.find(s => s?.email === email);
                        if (student) {
                            const nameEn = Array.isArray(student.name)
                                ? (student.name.find(n => n?.key === 'en')?.value || student.name.find(n => n?.value)?.value)
                                : '';
                            const schoolEn = Array.isArray(student.info?.school?.title)
                                ? (student.info.school.title.find(t => t?.key === 'en')?.value || student.info.school.title.find(t => t?.value)?.value)
                                : '';
                            const programEn = Array.isArray(student.info?.program?.title)
                                ? (student.info.program.title.find(t => t?.key === 'en')?.value || student.info.program.title.find(t => t?.value)?.value)
                                : '';

                            this.studentData = {
                                ...this.studentData,
                                name: nameEn || this.studentData.name,
                                studentID: student.studentID || this.studentData.studentID,
                                school: schoolEn || this.studentData.school,
                                program: programEn || this.studentData.program
                            };

                            // Update auth store so header uses the latest student data
                            if (this.$store?.commit) {
                                this.$store.commit('auth/setUser', {
                                    ...user,
                                    name: nameEn || user.name,
                                    email: student.email || user.email,
                                    studentID: student.studentID || user.studentID
                                });
                            }
                        }
                        if (!student) {
                            console.warn('Student profile not found for email', email);
                            this.studentData = {
                                ...this.studentData,
                                name: email || this.studentData.name,
                                studentID: this.studentData.studentID || '-',
                                school: this.studentData.school || '-',
                                program: this.studentData.program || '-'
                            };
                        }
                    } catch (err) {
                        console.error('Failed to load student profile', err);
                    }
                }
            }
        },
        async openDownloadModal() {
            this.showDownloadModal = true;
            this.selectedDocumentId = '';
            try {
                const res = await this.$api.documents('get', { status: 'Published' });
                this.publicDocuments = res?.data?.data || [];
            } catch (err) {
                console.error('Failed to load documents', err);
                this.publicDocuments = [];
            }
        },
        buildDocumentData() {
            const toPdfItems = (items) => {
                if (!Array.isArray(items)) return [];
                return items.map(item => ({
                    name: item?.name || 'N/A',
                    score: item?.percentage ?? item?.score ?? 0
                }));
            };
            return {
                StudentName: this.studentData.name,
                StudentID: this.studentData.studentID,
                School: this.studentData.school,
                Program: this.studentData.program,
                AcademyYear: String(new Date().getFullYear()),
                CompanyLogo: '',
                StudentPhoto: this.studentData.picture,
                GeneralCompetencies: toPdfItems(this.generalCompetencies),
                SpecificCompetencies: toPdfItems(this.specificCompetencies),
                Outstanding: this.Outstanding,
                Opportunities: this.Opportunities
            };
        },
        async handleDownload() {
            const doc = this.publicDocuments.find(d => d._id === this.selectedDocumentId);
            if (!doc) return;

            try {
                if (doc.content && doc.content.elements) {
                    await downloadClientPDF(
                        doc.content,
                        this.buildDocumentData(),
                        `${doc.title || doc.name || 'document'}.pdf`
                    );
                } else {
                    throw new Error('Template data is empty or invalid.');
                }
            } catch (err) {
                console.error('Failed to download PDF via Client', err);
            }
        },
    },
    computed: {
        ...mapGetters('member/students', { storedStudents: 'students' }),
        ...mapGetters('competencies/evaluation', { storedEvaluations: 'evaluations' }),
        publicDocumentOptions() {
            return this.publicDocuments.map(doc => ({
                value: doc._id,
                label: doc.title || doc.name || doc._id
            }));
        }
    }
};
</script>

<style scoped>
.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-title h1 {
    margin: 0;
    font-size: 28px;
    color: #333;
}

.header-title .subtitle {
    margin: 5px 0 0 0;
    color: #666;
    font-size: 14px;
}

.btn-download-pdf {
    background-color: #c41e3a;
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    transition: background-color 0.3s;
}

.btn-download-pdf:hover {
    background-color: #a01a32;
}

/* Student Info Card */
.student-info-card {
    background: white;
    padding: 20px;
    border-radius: 8px;
    margin-bottom: 30px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.student-profile {
    display: flex;
    align-items: center;
    gap: 20px;
}

.student-avatar {
    width: 100px;
    height: 100px;
    border-radius: 50%;
    object-fit: cover;
    border: 3px solid #e0e0e0;
}

.student-details h2 {
    margin: 0;
    font-size: 20px;
    color: #333;
}

.student-id {
    margin: 5px 0;
    color: #666;
    font-size: 14px;
}

.student-school {
    margin: 5px 0;
    color: #666;
    font-size: 14px;
}

/* Competencies Section */
.competencies-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
    margin-bottom: 30px;
}

.competency-category {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.competency-category h3 {
    margin: 0 0 20px 0;
    font-size: 16px;
    color: #333;
    border-bottom: 2px solid #c41e3a;
    padding-bottom: 10px;
}

.competency-list {
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.competency-item {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.competency-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.skill-name {
    font-size: 13px;
    color: #333;
    font-weight: 500;
}

.skill-percentage {
    font-size: 13px;
    color: #c41e3a;
    font-weight: bold;
}

.progress-bar {
    width: 100%;
    height: 6px;
    background-color: #e0e0e0;
    border-radius: 3px;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background-color: #c41e3a;
    border-radius: 3px;
    transition: width 0.3s ease;
}

/* Charts Section */
.charts-section {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 30px;
    margin-bottom: 30px;
}

.chart-container {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    flex-direction: column;
    gap: 15px;
    width: 100%;
}

.chart-container h4 {
    margin: 0;
    color: #333;
    font-size: 14px;
}

.chart-container canvas {
    max-width: 100%;
    height: 250px;
}

.chart-container svg {
    max-width: 100% !important;
    height: 250px !important;
}

.chart-legend {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 10px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    color: #666;
}

.legend-color {
    width: 12px;
    height: 12px;
    border-radius: 2px;
}

/* Feedback Section */
.feedback-section {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 30px;
}

.feedback-category {
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.feedback-category h3 {
    margin: 0 0 15px 0;
    font-size: 16px;
    color: #333;
    border-bottom: 2px solid #c41e3a;
    padding-bottom: 10px;
}

.feedback-item {
    margin-bottom: 20px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e0e0e0;
}

.feedback-item:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
}

.feedback-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 10px;
}

.feedback-profile {
    display: flex;
    align-items: center;
    gap: 10px;
}

.feedback-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid #e0e0e0;
}

.feedback-author h4 {
    margin: 0;
    font-size: 13px;
    color: #333;
    font-weight: 600;
}

.feedback-role {
    margin: 2px 0 0 0;
    font-size: 11px;
    color: #999;
}

.feedback-date {
    font-size: 11px;
    color: #999;
    background: #f5f5f5;
    padding: 4px 8px;
    border-radius: 4px;
}

.feedback-content ul {
    margin: 10px 0 0 0;
    padding-left: 20px;
    list-style: disc;
}

.feedback-content li {
    margin: 5px 0;
    font-size: 12px;
    color: #666;
    line-height: 1.4;
}

/* Responsive Design */
@media (max-width: 1200px) {

    .competencies-section,
    .charts-section,
    .feedback-section {
        grid-template-columns: 1fr;
    }
}

@media (max-width: 768px) {
    .dashboard-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }

    .student-profile {
        flex-direction: column;
        align-items: flex-start;
    }

    .student-avatar {
        width: 80px;
        height: 80px;
    }

    .competencies-section,
    .charts-section,
    .feedback-section {
        grid-template-columns: 1fr;
    }
}
</style>
