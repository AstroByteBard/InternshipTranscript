export default function buildSuggestionPlaceholder(count, lineLength) {
    const desiredCount = Math.max(1, Number(count) || 40);
    const line = 'X'.repeat(desiredCount);
    // Show 3 placeholder list items with the requested placeholder length
    return [line, line, line].join('\n');
}