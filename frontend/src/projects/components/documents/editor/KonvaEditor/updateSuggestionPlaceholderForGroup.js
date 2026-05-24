export default function updateSuggestionPlaceholderForGroup(group) {
    if (!group || !group.find) return;
    const fontSize = 14;
    const fontFamily = 'Inter, Arial';
    const baseWidth = Number(group.getAttr('columnWidth')) || 0;
    const scaleX = typeof group.scaleX === 'function' ? group.scaleX() : 1;
    const effectiveWidth = Math.max(20, (baseWidth * (scaleX || 1)) - 10);
    const charWidth = Math.max(1, this.measureTextWidth('X', fontSize, fontFamily));
    const lineLength = Math.max(1, Math.floor(effectiveWidth / charWidth));
    const placeholderText = this.buildSuggestionPlaceholder(this.suggestionCharCount, lineLength);
    const localWidth = Math.max(1, baseWidth - 10);

    group.find(node => node.getAttr && (node.getAttr('placeholderType') === 'suggestion' || node.getAttr('placeholderType') === 'suggestion-item'))
        .forEach((node) => {
            const pType = node.getAttr('placeholderType');
            if (pType === 'suggestion') {
                // remove bullet char from text content; a real circle will be rendered
                node.text(placeholderText);
                node.width(localWidth - 10);
                if (typeof node.wrap === 'function') node.wrap('none');
            } else if (pType === 'suggestion-item') {
                const nodeWidth = Math.max(10, node.width() || (localWidth - 10));
                const nodeFontSize = (node && typeof node.fontSize === 'function') ? (node.fontSize() || fontSize) : fontSize;
                const nodeFontFamily = (node && typeof node.fontFamily === 'function') ? (node.fontFamily() || fontFamily) : fontFamily;
                const desiredCount = Math.max(1, Number(this.suggestionCharCount) || 40);
                const nodeCharWidth = Math.max(1, this.measureTextWidth('X', nodeFontSize, nodeFontFamily));
                const charsPerLine = Math.max(1, Math.min(desiredCount, Math.floor(nodeWidth / nodeCharWidth)));
                // keep placeholder text within the visible column width
                node.text('X'.repeat(charsPerLine));
                node.width(nodeWidth);
                if (typeof node.wrap === 'function') node.wrap('none');
            }
        });
}
