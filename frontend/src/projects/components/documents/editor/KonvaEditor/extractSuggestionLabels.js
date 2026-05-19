export default function extractSuggestionLabels(doc) {
    if (!doc || !Array.isArray(doc.config)) return [];
    return doc.config
        .map(item => this.getLocalizedValue(item && item.label, 'en'))
        .filter(Boolean);
}