export default function extractHardskillLabels(doc, sortByLength) {
    if (!doc || doc.active !== true || !Array.isArray(doc.config)) return [];
    const locale = String(this.templateLocale || 'th').toLowerCase();
    const localeKey = locale.startsWith('th') ? 'th' : 'en';
    const labels = doc.config
        .map(item => {
            const label = this.getLocalizedValue(item && item.label, localeKey);
            if (label) return label;
            return this.getLocalizedValue(item && item.question, localeKey);
        })
        .filter(Boolean);
    if (!sortByLength) return labels;
    return labels.slice().sort((a, b) => b.length - a.length);
}