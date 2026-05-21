export default function handleNodeSelection(node, shiftKey) {
    if (this.editingNode && this.editingNode !== node) {
        try { this.endInlineEditing(true) } catch (e) { /* ignore */ }
    }
    if (!this.transformer) return
    const additive = !!(shiftKey && typeof shiftKey === 'object'
        ? (shiftKey.shiftKey || shiftKey.ctrlKey || shiftKey.metaKey)
        : shiftKey)
    const eventTime = shiftKey && typeof shiftKey === 'object' && typeof shiftKey.timeStamp === 'number'
        ? shiftKey.timeStamp
        : null
    if (this._lastSelectionEvent && this._lastSelectionEvent.node === node && this._lastSelectionEvent.additive === additive) {
        if (eventTime !== null && typeof this._lastSelectionEvent.timeStamp === 'number') {
            if (Math.abs(eventTime - this._lastSelectionEvent.timeStamp) < 300) return
        }
    }
    this._lastSelectionEvent = { node, additive, timeStamp: eventTime }
    const nodes = this.transformer.nodes().slice()
    if (additive) {
        const index = nodes.indexOf(node)
        if (index < 0) {
            nodes.push(node)
        }
        this.transformer.nodes(nodes)
    } else {
        this.transformer.nodes([node])
    }
    // cleanup any previous multi-drag handlers
    try {
        if (this._multiDragNodes && Array.isArray(this._multiDragNodes)) {
            this._multiDragNodes.forEach((n) => {
                try {
                    if (n && typeof n._multiDragCleanup === 'function') n._multiDragCleanup()
                } catch (err) { /* ignore */ }
            })
        }
    } catch (e) { /* ignore */ }

    // If multiple nodes selected, attach handlers so dragging one moves the rest
    try {
        const current = (this.transformer && typeof this.transformer.nodes === 'function') ? (this.transformer.nodes() || []) : []
        if (current && current.length > 1) {
            this._multiDragNodes = current.slice()
            this._multiDragNodes.forEach((n) => {
                if (!n) return
                const dragStart = (e) => {
                    try {
                        this._multiDragNodes.forEach((m) => {
                            if (!m) return
                            m._multiStartPos = { x: m.x(), y: m.y() }
                        })
                        n._multiBase = { x: n.x(), y: n.y() }
                    } catch (err) { /* ignore */ }
                }
                const dragMove = (e) => {
                    try {
                        if (!n._multiBase) return
                        const dx = n.x() - n._multiBase.x
                        const dy = n.y() - n._multiBase.y
                        this._multiDragNodes.forEach((m) => {
                            if (!m || m === n) return
                            const sp = m._multiStartPos || { x: m.x(), y: m.y() }
                            m.position({ x: sp.x + dx, y: sp.y + dy })
                        })
                        try { if (this.layer && typeof this.layer.batchDraw === 'function') this.layer.batchDraw() } catch (err) { }
                    } catch (err) { /* ignore */ }
                }
                const dragEnd = (e) => {
                    try {
                        this._multiDragNodes.forEach((m) => { if (m) delete m._multiStartPos })
                        delete n._multiBase
                    } catch (err) { /* ignore */ }
                }
                n.on('dragstart', dragStart)
                n.on('dragmove', dragMove)
                n.on('dragend', dragEnd)
                n._multiDragCleanup = () => { try { n.off('dragstart', dragStart); n.off('dragmove', dragMove); n.off('dragend', dragEnd); delete n._multiDragCleanup } catch (err) { } }
            })
        } else {
            this._multiDragNodes = []
        }
    } catch (err) { /* ignore */ }
    try {
        if (typeof this.transformer.forceUpdate === 'function') {
            this.transformer.forceUpdate()
        }
    } catch (e) { /* ignore */ }
    setTimeout(() => {
        try {
            if (this.transformer && typeof this.transformer.forceUpdate === 'function') {
                this.transformer.forceUpdate()
            }
            if (this.layer && typeof this.layer.batchDraw === 'function') {
                this.layer.batchDraw()
            }
        } catch (e) { /* ignore */ }
    }, 0)
    // Always bring transformer to top so it renders above all content nodes
    this.transformer.moveToTop()
    this.layer.batchDraw()
    try {
        if (typeof this.updateSelectionHighlights === 'function') {
            this.updateSelectionHighlights()
        }
    } catch (e) { /* ignore */ }
    try { this.emitSelectionChange() } catch (err) { /* ignore */ }
}
