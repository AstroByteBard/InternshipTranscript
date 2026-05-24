export default function getLocalizedValue(list, key = 'en') {
    if (!Array.isArray(list)) return '';
    const found = list.find(item => item && item.key === key);
    if (found && found.value) return found.value;
    const fallback = list.find(item => item && item.key === 'en');
    return fallback && fallback.value ? fallback.value : '';
}