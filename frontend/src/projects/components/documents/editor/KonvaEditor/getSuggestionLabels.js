export default function getSuggestionLabels() {
    const locale = String(this.templateLocale || 'th').toLowerCase();
    const isThai = locale.startsWith('th');
    if (this.suggestionLabels && this.suggestionLabels.length) {
        return this.suggestionLabels;
    }
    return isThai ? ['จุดเด่น', 'จุดที่ควรพัฒนา'] : ['Outstanding', 'Opportunity'];
}