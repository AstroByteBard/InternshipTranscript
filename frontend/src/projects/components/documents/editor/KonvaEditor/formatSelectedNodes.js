import Konva from 'konva'

export default function formatSelectedNodes({ type, value }) {
    const nodes = this.transformer.nodes();
    if (!nodes.length) return;

    const isProtectedGroup = (node) => {
        try {
            if (!node || typeof node.getClassName !== 'function' || node.getClassName() !== 'Group') return false;
            const name = typeof node.getAttr === 'function' ? String(node.getAttr('name') || '') : '';
            return name === 'graph-placeholder'
                || name === 'competency-table'
                || name === 'suggestion-table'
                || name === 'suggestion-table-part';
        } catch (err) {
            return false;
        }
    };

    nodes.forEach(node => {
        // If it's a Text node or a Group containing Text nodes (like tables)
        // For direct text nodes:
        if (node instanceof Konva.Text) {
            this.applyFormatToTextNode(node, type, value);
        } else if (node instanceof Konva.Group) {
            // Alignment should not recurse into protected widgets like graphs or tables.
            if (type === 'align' && isProtectedGroup(node)) return;

            // recursively find all text nodes inside group
            const textNodes = node.find('Text');
            textNodes.forEach(tn => this.applyFormatToTextNode(tn, type, value));
        }
    });
    this.layer.batchDraw();
}