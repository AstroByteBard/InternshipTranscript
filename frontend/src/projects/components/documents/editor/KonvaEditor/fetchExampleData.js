export default async function fetchExampleData() {
    try {
        // Use axios directly for fetching example data
        const axios = (await import('axios')).default;
        const response = await axios.get('http://localhost:8081/api/v1/member/example-data');
        if (response.data && response.data.data) {
            const locale = String(this.templateLocale || 'th').toLowerCase();
            const isThai = locale.startsWith('th');
            // Provide explicit Th/En fields so mapping can strictly pick one.
            const defaultData = {
                studentNameTh: 'ชื่อ-สกุล',
                studentNameEn: 'Name',
                studentIDTh: 'รหัสนักศึกษา',
                studentIDEn: 'Student ID',
                schoolTh: 'คณะ/โรงเรียน',
                schoolEn: 'School',
                programTh: 'สาขาวิชา',
                programEn: 'Major',
                academyYearTh: 'ปีการศึกษา xxxx',
                academyYearEn: 'Academic Year xxxx',
                competencies: {
                    programWithMostCompetenciesTh: 'สาขาวิชา',
                    programWithMostCompetenciesEn: 'Major',
                    competenciesCount: 0,
                    competenciesList: []
                }
            };

            const apiData = response.data.data || {};
            // Merge API data but keep explicit Th/En keys preferred when provided.
            this.exampleData = {
                ...defaultData,
                ...apiData,
                // ensure competency subfields are merged without overwriting language-specific keys
                competencies: {
                    ...defaultData.competencies,
                    ...(apiData.competencies || {})
                }
            };
        }
    } catch (err) {
        console.warn('Failed to fetch example data from API:', err);
        const locale = String(this.templateLocale || 'th').toLowerCase();
        const isThai = locale.startsWith('th');
        // Fallback exampleData with explicit language keys
        this.exampleData = {
            studentNameTh: 'ชื่อ-สกุล',
            studentNameEn: 'Name',
            studentIDTh: 'รหัสนักศึกษา',
            studentIDEn: 'Student ID',
            schoolTh: 'คณะ/โรงเรียน',
            schoolEn: 'School',
            programTh: 'สาขาวิชา',
            programEn: 'Major',
            academyYearTh: 'ปีการศึกษา xxxx',
            academyYearEn: 'Academic Year xxxx',
            competencies: {
                programWithMostCompetenciesTh: 'สาขาวิชา',
                programWithMostCompetenciesEn: 'Major',
                competenciesCount: 0,
                competenciesList: []
            }
        }
    }
}