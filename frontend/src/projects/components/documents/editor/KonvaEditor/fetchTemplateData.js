export default async function fetchTemplateData() {
    try {
        const locale = String(this.templateLocale || 'th').toLowerCase();
        const localeKey = locale.startsWith('th') ? 'th' : 'en';
        await Promise.all([
            this.$store.dispatch('competencies/general/general'),
            this.$store.dispatch('competencies/specific/specific'),
            this.$store.dispatch('competencies/proposition/proposition')
        ]);

        const generalList = this.getStoreList('competencies/general/general');
        const specificList = this.getStoreList('competencies/specific/specific');
        const suggestionList = this.getStoreList('competencies/proposition/proposition');

        const activeGeneral = generalList.filter(item => item && item.active === true);
        const activeSpecific = specificList.filter(item => item && item.active === true);
        const activeSuggestions = suggestionList.filter(item => item && item.active === true);

        const generalDoc = this.pickFirst(activeGeneral);
        const suggestionDoc = this.pickFirst(activeSuggestions);
        const specificDoc = this.pickSpecificByProgram(activeSpecific, this.exampleData);

        this.generalCompetencyLabels = this.extractSoftskillLabels(generalDoc);
        // store active general softskill document's localized title for display
        this.generalCompetencyDocName = generalDoc ? this.getLocalizedValue(generalDoc.title, localeKey) : '';
        this.specificCompetencyLabels = this.extractHardskillLabels(specificDoc, true);
        this.suggestionLabels = this.extractSuggestionLabels(suggestionDoc);
    } catch (err) {
        console.warn('Failed to fetch competency templates:', err);
    }
}