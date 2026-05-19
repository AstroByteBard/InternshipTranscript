import Konva from 'konva'

export default function toggleOrderedList() {
    const nodes = this.transformer.nodes();
    if (!nodes.length) {
        // If no node is selected, create a new ordered list block with 5 items
        const defaultText = [
            '1. List Item',
            '2. List Item',
            '3. List Item',
            '4. List Item',
            '5. List Item'
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

            // Check if lines are already numbered (e.g. starting with digits followed by period and space)
            const nonEmptyLines = lines.filter(l => l.trim().length > 0);
            const isAlreadyNumbered = nonEmptyLines.length > 0 && nonEmptyLines.every(line => {
                return /^\s*\d+\.\s*/.test(line);
            });

            let listIndex = 1;
            const newLines = lines.map(line => {
                if (isAlreadyNumbered) {
                    // Remove numbering prefix (e.g. "1. ", "2. ", "10. ")
                    return line.replace(/^\s*\d+\.\s*/, '');
                } else {
                    if (line.trim().length === 0) return line;
                    const cleaned = line.replace(/^\s*\d+\.\s*/, '');
                    const newLine = `${listIndex}. ${cleaned}`;
                    listIndex++;
                    return newLine;
                }
            });

            node.text(newLines.join('\n'));
            this.layer.batchDraw();
        }
    });

    this.saveHistory();
}
