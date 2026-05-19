import Konva from 'konva'

export default function updateSelectionHighlights() {
    if (!this.selectionLayer) return;
    // Clear previous selection highlights
    this.selectionLayer.destroyChildren();

    const nodes = (this.transformer && typeof this.transformer.nodes === 'function') ? this.transformer.nodes() : [];
    
    // Only show individual selection borders if more than 1 item is selected
    if (nodes.length > 1) {
        nodes.forEach((node) => {
            try {
                const box = node.getClientRect({ skipTransform: false });
                if (!box) return;

                // Draw a sleek dotted/dashed Indigo highlight rectangle around each individual selected node
                const rect = new Konva.Rect({
                    x: box.x - 2,
                    y: box.y - 2,
                    width: box.width + 4,
                    height: box.height + 4,
                    stroke: '#818cf8',      // Soft professional Indigo highlight color
                    strokeWidth: 1.5,
                    dash: [4, 3],
                    listening: false        // Crucial to prevent blocking clicks or drags
                });
                this.selectionLayer.add(rect);
            } catch (err) {
                // ignore drawing errors for single nodes
            }
        });
    }

    this.selectionLayer.batchDraw();
}
