export default function extractSuggestionLabels(doc) {
    if (!doc || !Array.isArray(doc.config)) return [];
    const locale = String(this.templateLocale || 'th').toLowerCase();
    const localeKey = locale.startsWith('th') ? 'th' : 'en';
    return doc.config
        .map(item => this.getLocalizedValue(item && item.label, localeKey))
        .filter(Boolean);
}