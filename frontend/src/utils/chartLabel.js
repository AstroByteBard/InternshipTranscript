export function formatChartLabel(label, maxLen = 18, lang = '') {
    if (!label) return '';

    if (Array.isArray(label)) return label;

    const text = String(label).trim();
    if (!text) return '';

    const languageHint = typeof lang === 'string' ? lang.toLowerCase() : '';
    const isThai = /[ก-๙]/.test(text) || languageHint.startsWith('th');

    // Thai labels: split by word boundaries when supported
    if (isThai && typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function') {
        const segmenter = new Intl.Segmenter('th', { granularity: 'word' });
        const segments = Array.from(segmenter.segment(text));

        const lines = [];
        let currentLine = '';

        segments.forEach((item) => {
            const word = String(item.segment || '').trim();
            if (!word) return;

            if ((currentLine + word).length > maxLen && currentLine !== '') {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine += word;
            }
        });

        if (currentLine) lines.push(currentLine);
        return lines.length === 1 ? lines[0] : lines;
    }

    // English / fallback: wrap by spaces, then by raw length if no spaces exist
    const words = text.split(/\s+/).filter(Boolean);
    if (!words.length) return text;

    const lines = [];
    let currentLine = '';

    words.forEach((word) => {
        const candidate = currentLine ? `${currentLine} ${word}` : word;
        if (candidate.length > maxLen && currentLine !== '') {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = candidate;
        }
    });

    if (currentLine) lines.push(currentLine);

    if (lines.length === 1 && lines[0].length > maxLen) {
        const chunks = [];
        for (let i = 0; i < text.length; i += maxLen) {
            chunks.push(text.slice(i, i + maxLen));
        }
        return chunks.length === 1 ? chunks[0] : chunks;
    }

    return lines.length === 1 ? lines[0] : lines;
}