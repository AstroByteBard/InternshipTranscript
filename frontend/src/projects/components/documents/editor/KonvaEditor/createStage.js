import Konva from 'konva'

export default function createStage() {
    const container = this.$refs.stageContainer
    // Lock stage to A4 standard width (210mm) and height (297mm) in px at 96 PPI
    const width = 794;
    const height = 1123;

    this.stage = new Konva.Stage({
        container: container,
        width,
        height,
    })

    this.layer = new Konva.Layer()
    this.stage.add(this.layer)

    // white background rect to represent A4
    const bg = new Konva.Rect({
        x: 0,
        y: 0,
        width: width,
        height: height,
        fill: 'white',
        name: 'background-rect'
    })
    this.layer.add(bg)

    // Initial history state
    this.$nextTick(() => {
        this.saveHistory();
    });

    this.transformer = new Konva.Transformer({
        enabledAnchors: ['top-left', 'top-center', 'top-right', 'middle-right', 'bottom-right', 'bottom-center', 'bottom-left', 'middle-left'],
        rotateEnabled: true,
        ignoreStroke: true,
        keepRatio: true,
        // Sleek Premium Selection Styles (Figma/Canva inspired)
        borderStroke: '#4f46e5',      // Indigo border line
        borderStrokeWidth: 1.5,       // Thin professional border
        anchorFill: '#ffffff',        // White fill inside anchors
        anchorStroke: '#4f46e5',      // Indigo stroke for anchors
        anchorStrokeWidth: 1.5,       // Border size of anchors
        anchorSize: 8,                // Small elegant anchors
        anchorCornerRadius: 4,        // Perfect circular anchors!
        rotateAnchorOffset: 25,       // Space between node and rotate handle
        boundBoxFunc: function (oldBox, newBox) {
            // prevent negative or too-small sizes
            const minSize = 16
            if (newBox.width < minSize || newBox.height < minSize) {
                return oldBox
            }
            return newBox
        }
    })
    this.layer.add(this.transformer)

    this.transformer.on('transform', () => {
        if (typeof this.updateSelectionHighlights === 'function') {
            this.updateSelectionHighlights();
        }
        try {
            this.emitSelectionChange();
        } catch (e) {}
    })

    // When user finishes a transform via Transformer, bake scale into children's attributes
    // so text uses real fontSize values instead of visual scale (prevents font distortion).
    this.transformer.on('transformend', () => {
        try {
            const nodes = this.transformer.nodes() || [];
            if (!nodes || !nodes.length) return;
            nodes.forEach((n) => {
                try {
                    const name = (typeof n.name === 'function') ? n.name() : (n.getAttr && n.getAttr('name'));
                    // let group-specific handlers manage suggestion/competency groups
                    if (name && (String(name).includes('suggestion-table-part') || String(name).includes('competency-table'))) {
                        return;
                    }
                    this.bakeNodeScale(n)
                } catch (err) {
                    console.warn('bakeNodeScale inner error', err)
                }
            })
            // ensure transformer recalculates its bounding box to match baked node sizes
            try {
                if (this.transformer && typeof this.transformer.forceUpdate === 'function') {
                    const currentNodes = (typeof this.transformer.nodes === 'function') ? (this.transformer.nodes() || []) : [];
                    try { this.transformer.nodes([]) } catch (e) { }
                    setTimeout(() => {
                        try { this.transformer.nodes(currentNodes); if (typeof this.transformer.forceUpdate === 'function') this.transformer.forceUpdate(); } catch (e) { }
                        try { if (this.layer && typeof this.layer.batchDraw === 'function') this.layer.batchDraw(); } catch (e) { }
                        try { this.emitSelectionChange() } catch (err) { /* ignore */ }
                    }, 0);
                }
            } catch (e) { /* ignore */ }
            this.layer.batchDraw()
            this.saveHistory()
            try { this.emitSelectionChange() } catch (err) { /* ignore */ }
        } catch (err) {
            console.warn('transformend handler error', err)
        }
    })

    // guide layer for alignment lines (on top of main layer)
    this.guideLayer = new Konva.Layer()
    this.stage.add(this.guideLayer)

    // selection highlight layer (on top of guide layer, transparent to events)
    this.selectionLayer = new Konva.Layer({ listening: false })
    this.stage.add(this.selectionLayer)

    // draw baseline layer
    this.layer.draw()

    // alignment drag handlers
    this.stage.on('dragmove', (e) => {
        const target = e.target
        if (!target || typeof target.draggable !== 'function' || !target.draggable()) return
        this.showAlignmentGuides(target)
        if (typeof this.updateSelectionHighlights === 'function') {
            this.updateSelectionHighlights();
        }
    })
    this.stage.on('dragend', () => {
        this.clearAlignmentGuides()
        if (typeof this.updateSelectionHighlights === 'function') {
            this.updateSelectionHighlights();
        }
    })

    this.stage.on('mousedown touchstart', (e) => {
        // If inline editing is active
        if (this.editingNode) {
            if (e.target === this.editingNode) {
                // Move caret to clicked position within the editing node
                const pos = this.stage.getPointerPosition()
                const idx = this.getCaretIndexFromPointer(this.editingNode, pos)
                this.caretIndex = idx
                this.updateCaretPosition()
                return
            } else {
                // clicked outside editing node -> commit and end editing
                this.endInlineEditing(true)
            }
        }

        if (e.target === this.stage || e.target === bg) {
            this.transformer.nodes([])
            this.layer.draw()
            try { this.emitSelectionChange() } catch (err) { /* ignore */ }
        }
    })

    this.stage.on('dblclick dbltap', (e) => {
        const target = e.target
        // If double-clicked on background/stage -> clear selection
        if (target === this.stage || target === bg) {
            this.transformer.nodes([])
            this.layer.draw()
            try { this.emitSelectionChange() } catch (err) { /* ignore */ }
            return
        }

        // If double-clicked a Text node -> select and start editing
        if (target && typeof target.getClassName === 'function' && target.getClassName() === 'Text') {
            const shift = e && e.evt ? !!e.evt.shiftKey : false
            this.handleNodeSelection(target, shift)
            this.startEditingText(target)
            return
        }

        // Otherwise do nothing here — group/child click handlers will manage selection
    })

    // setup HTML5 drag and drop on the container
    container.addEventListener('dragover', (e) => {
        e.preventDefault() // required to allow drop
    })

    container.addEventListener('drop', (e) => {
        e.preventDefault()
        const data = e.dataTransfer.getData('application/json')
        if (!data) return
        try {
            const parsed = JSON.parse(data)
            if (parsed.type === 'variable') {
                // get pointer position relative to stage
                this.stage.setPointersPositions(e)
                const pos = this.stage.getPointerPosition()
                // convert absolute pointer position to stage coordinates taking scale into account
                const scale = this.stage.scaleX()
                const x = (pos.x - this.stage.x()) / scale
                const y = (pos.y - this.stage.y()) / scale

                // Use unified insertVariable logic
                this.insertVariable(parsed.value, { left: x, top: y })
            }
        } catch (err) {
            console.error('Invalid drop data', err)
        }
    })

    // Attach keydown listener for keyboard shortcuts (delete, undo, redo, layer controls, etc.)
    this._onKeyDownHandler = (e) => this.onKeyDown(e)
    document.addEventListener('keydown', this._onKeyDownHandler)
}
