export default function buildSuggestionPlaceholder(count, lineLength) {
    const chunk = Math.max(10, Number(lineLength) || 20);
    // Intentionally make it longer than the line to ensure it fills up to the edge
    const line = '• ' + 'X'.repeat(chunk + 10);
    // Show 3 placeholder list items
    return [line, line, line].join('\n');
}