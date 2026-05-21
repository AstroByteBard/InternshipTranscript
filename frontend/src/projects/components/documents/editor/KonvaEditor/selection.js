export default {
    computeSelectionStyle() {
        const nodes = (this.transformer && typeof this.transformer.nodes === 'function') ? this.transformer.nodes() : [];
        if (!nodes || !nodes.length) return null;
        const attrs = ['fontSize', 'fontFamily', 'fill', 'fontStyle', 'textDecoration', 'align', 'lineHeight'];
        const result = {};
        attrs.forEach((a) => result[a] = undefined);

        nodes.forEach((node, idx) => {
            attrs.forEach((a) => {
                let val;
                try {
                    if (node.getAttr && typeof node.getAttr === 'function') {
                        const av = node.getAttr(a);
                        if (typeof av !== 'undefined' && av !== null) {
                            val = av;
                        } else {
                            if (a === 'fontSize' && node.fontSize) {
                                val = node.fontSize();
                            } else if (a === 'fontFamily' && node.fontFamily) {
                                val = node.fontFamily();
                            } else if (a === 'fill' && node.fill) {
                                val = node.fill();
                            } else if (a === 'fontStyle' && node.fontStyle) {
                                val = node.fontStyle();
                            } else if (a === 'textDecoration' && node.textDecoration) {
                                val = node.textDecoration();
                            } else if (a === 'align' && node.align) {
                                val = node.align();
                            } else if (a === 'lineHeight' && node.lineHeight) {
                                val = node.lineHeight();
                            }
                        }
                    } else if (a === 'fontSize' && node.fontSize) {
                        val = node.fontSize();
                    } else if (a === 'fontFamily' && node.fontFamily) {
                        val = node.fontFamily();
                    } else if (a === 'fill' && node.fill) {
                        val = node.fill();
                    } else if (a === 'fontStyle' && node.fontStyle) {
                        val = node.fontStyle();
                    } else if (a === 'textDecoration' && node.textDecoration) {
                        val = node.textDecoration();
                    } else if (a === 'align' && node.align) {
                        val = node.align();
                    } else if (a === 'lineHeight' && node.lineHeight) {
                        val = node.lineHeight();
                    }
                } catch (err) {
                    val = undefined
                }

                if (idx === 0) {
                    result[a] = typeof val !== 'undefined' ? val : null;
                } else {
                    if (result[a] !== null && typeof val !== 'undefined' && String(result[a]) === String(val)) {
                        // keep
                    } else {
                        result[a] = null;
                    }
                }
            })
        })

        return { count: nodes.length, style: result };
    },

    emitSelectionChange() {
        const info = this.computeSelectionStyle();
        this.$emit('selection-changed', info);
    },

    multiEditSelectedNodes() {
        const nodes = (this.transformer && typeof this.transformer.nodes === 'function') ? this.transformer.nodes() : [];
        if (!nodes || !nodes.length) return;
        if (nodes.length === 1) {
            const n = nodes[0];
            if (n && typeof n.getClassName === 'function' && n.getClassName() === 'Text') {
                try { this.startEditingText(n) } catch (err) { /* ignore */ }
                return;
            }
        }
        // For multiple selection: ask for replacement text
        const input = window.prompt('Edit text for selected items (will replace existing content)', '');
        if (input === null) return;
        nodes.forEach((n) => {
            try {
                if (n && typeof n.getClassName === 'function' && n.getClassName() === 'Text') {
                    n.text(input)
                }
            } catch (err) { /* ignore */ }
        })
        this.layer.batchDraw();
        this.saveHistory();
        try { this.emitSelectionChange() } catch (err) { /* ignore */ }
    },

    handleNodeSelection(node, shiftKey) {
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
        try {
            if (typeof this.transformer.forceUpdate === 'function') {
                this.transformer.forceUpdate()
            }
        } catch (err) { /* ignore */ }
        setTimeout(() => {
            try {
                if (this.transformer && typeof this.transformer.forceUpdate === 'function') {
                    this.transformer.forceUpdate()
                }
                if (this.layer && typeof this.layer.batchDraw === 'function') {
                    this.layer.batchDraw()
                }
            } catch (err) { /* ignore */ }
        }, 0)
        this.layer.batchDraw()
        try {
            if (typeof this.updateSelectionHighlights === 'function') {
                this.updateSelectionHighlights()
            }
        } catch (err) { /* ignore */ }
        try { this.emitSelectionChange() } catch (err) { /* ignore */ }
    }
}
