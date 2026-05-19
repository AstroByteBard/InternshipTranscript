export default function updateSuggestionPlaceholderForGroup(group) {
    if (!group || !group.find) return;
    const fontSize = 14;
    const fontFamily = 'Inter, Arial';
    const baseWidth = Number(group.getAttr('columnWidth')) || 0;
    const scaleX = typeof group.scaleX === 'function' ? group.scaleX() : 1;
    const effectiveWidth = Math.max(20, (baseWidth * (scaleX || 1)) - 20);
    const charWidth = Math.max(1, this.measureTextWidth('X', fontSize, fontFamily));
    const lineLength = Math.max(1, Math.floor(effectiveWidth / charWidth));
    const placeholderText = this.buildSuggestionPlaceholder(this.suggestionCharCount, lineLength);
    const localWidth = Math.max(1, baseWidth - 20);

    group.find(node => node.getAttr && (node.getAttr('placeholderType') === 'suggestion' || node.getAttr('placeholderType') === 'suggestion-item'))
        .forEach((node) => {
            const pType = node.getAttr('placeholderType');
            if (pType === 'suggestion') {
                node.text(placeholderText);
                node.width(localWidth);
                node.wrap('none');
            } else if (pType === 'suggestion-item') {
                const nodeWidth = Math.max(10, node.width() || (localWidth - 20));
                const nodeFontSize = (node && typeof node.fontSize === 'function') ? (node.fontSize() || fontSize) : fontSize;
                const nodeFontFamily = (node && typeof node.fontFamily === 'function') ? (node.fontFamily() || fontFamily) : fontFamily;
                const cw = Math.max(1, this.measureTextWidth('X', nodeFontSize, nodeFontFamily));
                const n = Math.max(6, Math.floor(nodeWidth / cw));
                node.text('• ' + 'X'.repeat(n - 2));
                node.width(nodeWidth);
            }
        });
}
