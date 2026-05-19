export default async function fetchExampleData() {
    try {
        // Use axios directly for fetching example data
        const axios = (await import('axios')).default;
        const response = await axios.get('http://localhost:8081/api/v1/member/example-data');
        if (response.data && response.data.data) {
            this.exampleData = response.data.data;
        }
    } catch (err) {
        console.warn('Failed to fetch example data from API:', err);
        // Keep default values if API fails
    }
}