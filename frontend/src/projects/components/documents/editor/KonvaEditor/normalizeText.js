export default function normalizeText(value) {
    return (value || '').toString().trim().toLowerCase();
}