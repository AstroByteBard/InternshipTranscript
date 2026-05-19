import Konva from 'konva'

export default function toggleBulletList() {
    const nodes = this.transformer.nodes();
    if (!nodes.length) {
        // If no node is selected, create a new bullet list block with 5 items
        const defaultText = [
            '• List Item',
            '• List Item',
            '• List Item',
            '• List Item',
            '• List Item'
        ].join('\n');
        this.addTextBlock(defaultText).then(node => {
            try { this.startInlineEditing(node) } catch (e) { }
        });
        return;
    }

    nodes.forEach(node => {
        if (node instanceof Konva.Text) {
            const currentText = node.text() || '';
            const lines = currentText.split('\n');

            // Check if all non-empty lines already start with a bullet prefix
            const nonEmptyLines = lines.filter(l => l.trim().length > 0);
            const isAlreadyBulleted = nonEmptyLines.length > 0 && nonEmptyLines.every(line => {
                const trimmed = line.trimStart();
                return trimmed.startsWith('•') || trimmed.startsWith('*') || trimmed.startsWith('-');
            });

            const newLines = lines.map(line => {
                if (isAlreadyBulleted) {
                    // Remove bullet prefix (e.g., "• ", "* ", "- ")
                    return line.replace(/^\s*[•*-]\s*/, '');
                } else {
                    if (line.trim().length === 0) return line;
                    const cleaned = line.replace(/^\s*[•*-]\s*/, '');
                    return `• ${cleaned}`;
                }
            });

            node.text(newLines.join('\n'));
            this.layer.batchDraw();
        }
    });

    this.saveHistory();
}
