export default function getLocaleFontFamily(locale) {
    const normalized = String(locale || 'en').toLowerCase();
    if (normalized.startsWith('th')) return 'Noto Sans Thai';
    if (normalized.startsWith('en')) return 'Source Sans 3';
    return '';
}