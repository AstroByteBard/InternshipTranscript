import Konva from 'konva'

export default function formatSelectedNodes({ type, value }) {
    const nodes = this.transformer.nodes();
    if (!nodes.length) return;

    nodes.forEach(node => {
        // If it's a Text node or a Group containing Text nodes (like tables)
        // For direct text nodes:
        if (node instanceof Konva.Text) {
            this.applyFormatToTextNode(node, type, value);
        } else if (node instanceof Konva.Group) {
            // recursively find all text nodes inside group
            const textNodes = node.find('Text');
            textNodes.forEach(tn => this.applyFormatToTextNode(tn, type, value));
        }
    });
    this.layer.batchDraw();
}