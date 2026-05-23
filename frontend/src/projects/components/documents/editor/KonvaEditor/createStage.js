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

    this.history = []
    this.historyIndex = -1
    this._historySnapshot = null
    this.isApplyingHistory = false
    this.historyLog = []

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
        padding: 0,
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
        try {
            const nodes = typeof this.transformer.nodes === 'function' ? (this.transformer.nodes() || []) : []
            if (nodes.length === 1 && nodes[0] && typeof this.showAlignmentGuides === 'function') {
                this.showAlignmentGuides(nodes[0])
            }
            if (typeof this.renderManualDataVariableConnectors === 'function') {
                this.renderManualDataVariableConnectors()
            }
        } catch (e) { }
        if (typeof this.updateSelectionHighlights === 'function') {
            this.updateSelectionHighlights();
        }
        try {
            this.emitSelectionChange();
        } catch (e) { }
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
            this.clearAlignmentGuides()
            this.saveHistory()
            try { this.emitSelectionChange() } catch (err) { /* ignore */ }
        } catch (err) {
            console.warn('transformend handler error', err)
        }
    })

    // Allow shift+dragging the Transformer frame to move all selected nodes together
    this.transformer.on('mousedown touchstart', (e) => {
        try {
            const evt = e && e.evt ? e.evt : null
            const isShift = evt && (evt.shiftKey || evt.ctrlKey || evt.metaKey)
            if (!isShift) return
            const nodes = (typeof this.transformer.nodes === 'function') ? (this.transformer.nodes() || []) : []
            if (!nodes || nodes.length <= 1) return // only for multi-select

            const pointer = this.stage.getPointerPosition() || { x: 0, y: 0 }
            const startPointer = { x: pointer.x, y: pointer.y }
            const startPositions = nodes.map(n => ({ node: n, x: n.x(), y: n.y() }))

            const moveHandler = () => {
                try {
                    const p = this.stage.getPointerPosition() || { x: 0, y: 0 }
                    const dx = p.x - startPointer.x
                    const dy = p.y - startPointer.y
                    startPositions.forEach((s) => {
                        try { s.node.position({ x: s.x + dx, y: s.y + dy }) } catch (err) { }
                    })
                    try { if (this.layer && typeof this.layer.batchDraw === 'function') this.layer.batchDraw() } catch (err) { }
                } catch (err) { /* ignore */ }
            }

            const upHandler = () => {
                try {
                    this.stage.off('mousemove', moveHandler)
                    this.stage.off('touchmove', moveHandler)
                    this.stage.off('mouseup', upHandler)
                    this.stage.off('touchend', upHandler)
                    // finalize history after move
                    try { if (typeof this.saveHistory === 'function') this.saveHistory() } catch (err) { }
                    try { if (typeof this.emitSelectionChange === 'function') this.emitSelectionChange() } catch (err) { }
                } catch (err) { /* ignore */ }
            }

            this.stage.on('mousemove', moveHandler)
            this.stage.on('touchmove', moveHandler)
            this.stage.on('mouseup', upHandler)
            this.stage.on('touchend', upHandler)
        } catch (err) { /* ignore */ }
    })

    // guide layer for alignment lines (on top of main layer)
    this.connectorLayer = new Konva.Layer()
    this.stage.add(this.connectorLayer)

    // guide layer for alignment lines (on top of connector layer)
    this.guideLayer = new Konva.Layer()
    this.stage.add(this.guideLayer)

    // selection highlight layer (on top of guide layer, transparent to events)
    this.selectionLayer = new Konva.Layer({ listening: false })
    this.stage.add(this.selectionLayer)

    // marquee selection rect (for drag-to-select)
    this._marqueeRect = new Konva.Rect({ x: 0, y: 0, width: 0, height: 0, visible: false, fill: 'rgba(79,70,229,0.06)', stroke: '#4f46e5', strokeWidth: 1, dash: [4, 4], listening: false })
    this.selectionLayer.add(this._marqueeRect)

    // draw baseline layer
    this.layer.draw()

    // alignment drag handlers
    this.stage.on('dragmove', (e) => {
        const target = e.target
        if (!target || typeof target.draggable !== 'function' || !target.draggable()) return
        this.showAlignmentGuides(target)
        if (typeof this.renderManualDataVariableConnectors === 'function') {
            this.renderManualDataVariableConnectors()
        }
        if (typeof this.updateSelectionHighlights === 'function') {
            this.updateSelectionHighlights();
        }
    })
    this.stage.on('dragend', () => {
        this.clearAlignmentGuides()
        if (typeof this.clearManualDataVariableLinkPreview === 'function') {
            this.clearManualDataVariableLinkPreview()
        }
        if (typeof this.renderManualDataVariableConnectors === 'function') {
            this.renderManualDataVariableConnectors()
        }
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
            // start marquee selection (drag-to-select)
            const domEvent = e && e.evt ? e.evt : null
            const startPos = this.stage.getPointerPosition() || { x: 0, y: 0 }
            this._marqueeRect.visible(true)
            this._marqueeRect.x(startPos.x)
            this._marqueeRect.y(startPos.y)
            this._marqueeRect.width(0)
            this._marqueeRect.height(0)
            this.selectionLayer.batchDraw()

            const onMove = () => {
                const pos = this.stage.getPointerPosition() || { x: 0, y: 0 }
                const x = Math.min(pos.x, startPos.x)
                const y = Math.min(pos.y, startPos.y)
                const w = Math.abs(pos.x - startPos.x)
                const h = Math.abs(pos.y - startPos.y)
                this._marqueeRect.x(x)
                this._marqueeRect.y(y)
                this._marqueeRect.width(w)
                this._marqueeRect.height(h)
                this.selectionLayer.batchDraw()
            }

            const onUp = (upEvt) => {
                try {
                    const pos = this.stage.getPointerPosition() || { x: 0, y: 0 }
                    const dx = Math.abs(pos.x - startPos.x)
                    const dy = Math.abs(pos.y - startPos.y)
                    this._marqueeRect.visible(false)
                    this.selectionLayer.batchDraw()
                    this.stage.off('mousemove', onMove)
                    this.stage.off('touchmove', onMove)
                    this.stage.off('mouseup', onUp)
                    this.stage.off('touchend', onUp)

                    // treat as click if tiny movement
                    if (dx < 6 && dy < 6) {
                        this.transformer.nodes([])
                        this.layer.draw()
                        try { this.emitSelectionChange() } catch (err) { /* ignore */ }
                        return
                    }

                    // compute intersection with nodes on this.layer
                    const r = this._marqueeRect.getClientRect()
                    const hits = []
                    const children = this.layer.getChildren().toArray ? this.layer.getChildren().toArray() : Array.from(this.layer.getChildren())
                    children.forEach((c) => {
                        try {
                            if (!c || typeof c.getClientRect !== 'function') return
                            // only include draggable content nodes (groups, shapes)
                            if (typeof c.draggable === 'function' && !c.draggable()) return
                            const rect = c.getClientRect({ skipTransform: true })
                            if (!rect) return
                            const intersect = !(r.x > rect.x + rect.width || r.x + r.width < rect.x || r.y > rect.y + rect.height || r.y + r.height < rect.y)
                            if (intersect) hits.push(c)
                        } catch (err) { /* ignore */ }
                    })

                    const modifier = domEvent
                    const additive = !!(modifier && (modifier.shiftKey || modifier.ctrlKey || modifier.metaKey))
                    if (hits.length) {
                        const nodes = additive ? (this.transformer.nodes().slice().concat(hits.filter(h => this.transformer.nodes().indexOf(h) === -1))) : hits
                        try { this.transformer.nodes(nodes) } catch (err) { }
                        try { if (typeof this.transformer.forceUpdate === 'function') this.transformer.forceUpdate() } catch (err) { }
                        try { this.layer.batchDraw() } catch (err) { }
                        try { this.emitSelectionChange() } catch (err) { }
                    } else {
                        // no hits: clear selection
                        this.transformer.nodes([])
                        this.layer.draw()
                        try { this.emitSelectionChange() } catch (err) { /* ignore */ }
                    }
                } catch (err) { /* ignore */ }
            }

            this.stage.on('mousemove', onMove)
            this.stage.on('touchmove', onMove)
            this.stage.on('mouseup', onUp)
            this.stage.on('touchend', onUp)
            return
        }
    })

    this.stage.on('dblclick dbltap', (e) => {
        const target = e.target
        const selectedNodes = (this.transformer && typeof this.transformer.nodes === 'function') ? (this.transformer.nodes() || []) : []

        const isTargetInSelectedTree = (node) => {
            if (!node || !selectedNodes.length) return false
            return selectedNodes.some((selected) => {
                let current = node
                while (current) {
                    if (current === selected) return true
                    current = (typeof current.getParent === 'function') ? current.getParent() : null
                }
                return false
            })
        }

        const isTransformerTarget = target === this.transformer ||
            (target && typeof target.getClassName === 'function' && target.getClassName() === 'Transformer') ||
            (target && typeof target.getParent === 'function' && target.getParent() === this.transformer)

        // If double-clicked on background/stage -> clear selection
        if (target === this.stage || target === bg) {
            this.transformer.nodes([])
            this.layer.draw()
            try { this.emitSelectionChange() } catch (err) { /* ignore */ }
            return
        }

        // Double-click current selection frame (or selected non-text node) -> unselect
        if (isTransformerTarget || (isTargetInSelectedTree(target) && !(target && typeof target.getClassName === 'function' && target.getClassName() === 'Text'))) {
            this.transformer.nodes([])
            this.layer.draw()
            try { this.emitSelectionChange() } catch (err) { /* ignore */ }
            return
        }

        // If double-clicked a Text node -> select and start editing
        if (target && typeof target.getClassName === 'function' && target.getClassName() === 'Text') {
            const modifierEvent = e && e.evt ? e.evt : null
            this.handleNodeSelection(target, modifierEvent)
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
