export default function getLocalizedValue(list, key = 'en') {
    if (!Array.isArray(list)) return '';
    const found = list.find(item => item && item.key === key);
    return found && found.value ? found.value : '';
}