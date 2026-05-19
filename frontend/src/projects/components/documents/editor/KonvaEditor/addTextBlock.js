import Konva from 'konva'

export default function addTextBlock(text = 'Add Text', opts = {}) {
    return new Promise((resolve) => {
        const maxW = this.stage.width()
        const maxH = this.stage.height()
        const defaultFontSize = opts.fontSize ? Number(opts.fontSize) : 20

        // If width is not provided, let Konva auto-size it to match text length
        const initialW = opts.width ? Number(opts.width) : undefined

        const x = typeof opts.left !== 'undefined' ? Number(opts.left) : (initialW ? Math.max(10, Math.floor((maxW - initialW) / 2)) : 50)
        const y = typeof opts.top !== 'undefined' ? Number(opts.top) : 30

        const konvaText = new Konva.Text({
            x, y, text,
            fontSize: defaultFontSize,
            fontFamily: 'Inter, Arial',
            fill: '#1e293b',
            fontStyle: opts.fontWeight || 'normal',
            draggable: true,
            width: initialW,
            wrap: initialW ? 'word' : 'none',
            padding: 5,
            lineHeight: 1.2,
            align: 'left'
        });

        this.assignCreationOrder(konvaText)
        this.layer.add(konvaText)
        this.transformer.moveToTop()

        konvaText.on('click tap', (e) => {
            this.handleNodeSelection(konvaText, e.evt.shiftKey)
        })
        konvaText.on('dragmove', () => {
            const pos = konvaText.position();
            const curW = konvaText.width() * konvaText.scaleX();
            const curH = konvaText.height() * konvaText.scaleY();
            const nx = Math.max(0, Math.min(pos.x, maxW - curW));
            const ny = Math.max(0, Math.min(pos.y, maxH - curH));
            if (nx !== pos.x || ny !== pos.y) konvaText.position({ x: nx, y: ny });
        });
        konvaText.on('transform', () => {
            const minSize = 8;
            const scaleX = konvaText.scaleX();
            const scaleY = konvaText.scaleY();
            const curW = konvaText.width() * scaleX;
            const curH = konvaText.height() * scaleY;
            if (curW < minSize || curH < minSize) {
                konvaText.scaleX(Math.max(1, minSize / konvaText.width()));
                konvaText.scaleY(Math.max(1, minSize / konvaText.height()));
            }
            const pos = konvaText.position();
            const nx = Math.max(0, Math.min(pos.x, maxW - curW));
            const ny = Math.max(0, Math.min(pos.y, maxH - curH));
            if (nx !== pos.x || ny !== pos.y) konvaText.position({ x: nx, y: ny });
        });
        konvaText.on('transformend', () => {
            const scaleX = konvaText.scaleX();
            const scaleY = konvaText.scaleY();
            let newW = Math.max(1, Math.floor(konvaText.width() * scaleX));
            let newFontSize = Math.max(8, Math.floor(konvaText.fontSize() * (scaleY * (this.fontScaleMultiplier || 1))));
            if (newW > maxW) newW = maxW;
            konvaText.width(newW);
            konvaText.fontSize(newFontSize);
            konvaText.scaleX(1);
            konvaText.scaleY(1);
            const pos = konvaText.position();
            const nx = Math.max(0, Math.min(pos.x, maxW - konvaText.width()));
            const ny = Math.max(0, Math.min(pos.y, maxH - konvaText.height()));
            if (nx !== pos.x || ny !== pos.y) konvaText.position({ x: nx, y: ny });
            // ensure transformer recalculates its bounding box for this text (defer to next tick)
            try {
                if (this.transformer && typeof this.transformer.forceUpdate === 'function') {
                    const cur = (typeof this.transformer.nodes === 'function') ? (this.transformer.nodes() || []) : [];
                    try { this.transformer.nodes([]) } catch (e) { }
                    setTimeout(() => {
                        try { this.transformer.nodes(cur && cur.length ? cur : [konvaText]); this.transformer.forceUpdate(); } catch (e) { }
                        try { if (this.layer && typeof this.layer.batchDraw === 'function') this.layer.batchDraw(); } catch (e) { }
                        try { this.emitSelectionChange() } catch (err) { /* ignore */ }
                    }, 0);
                }
            } catch (e) { /* ignore */ }

            this.layer.draw();
            this.saveHistory();
        });
        konvaText.on('dragend', () => {
            this.layer.draw();
            this.saveHistory();
        });
        konvaText.on('mousedown', (e) => {
            if (this.editingNode === konvaText) {
                const pos = this.stage.getPointerPosition();
                const idx = this.getCaretIndexFromPointer(konvaText, pos);
                this.caretIndex = idx;
                this.updateCaretPosition();
            }
        });

        if (typeof opts.onCreate === 'function') {
            opts.onCreate(konvaText)
        }

        this.layer.draw()
        this.saveHistory()
        resolve(konvaText)
    })
}
