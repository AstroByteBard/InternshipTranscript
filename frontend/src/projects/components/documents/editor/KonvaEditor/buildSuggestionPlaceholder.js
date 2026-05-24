export default function buildSuggestionPlaceholder(count, lineLength) {
    const desiredCount = Math.max(1, Number(count) || 40);
    const charsPerLine = Math.max(1, Math.min(desiredCount, Math.max(1, Number(lineLength) || desiredCount)));
    const line = 'X'.repeat(charsPerLine);
    // Show 3 placeholder list items with the requested placeholder length
    return [line, line, line].join('\n');
}