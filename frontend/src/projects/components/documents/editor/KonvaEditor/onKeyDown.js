export default function onKeyDown(e) {
    // If we're inline-editing a Konva.Text, interpret keys as text input
    if (this.editingNode) {
        const key = e.key
        const txt = this.editingNode.text()
        // printable character
        if (key.length === 1 && !e.ctrlKey && !e.metaKey) {
            const before = txt.slice(0, this.caretIndex)
            const after = txt.slice(this.caretIndex)
            this.editingNode.text(before + key + after)
            this.caretIndex = Math.min(txt.length + 1, this.caretIndex + 1)
        } else if (key === 'Backspace') {
            if (this.caretIndex > 0) {
                const before = txt.slice(0, this.caretIndex - 1)
                const after = txt.slice(this.caretIndex)
                this.editingNode.text(before + after)
                this.caretIndex = Math.max(0, this.caretIndex - 1)
            }
        } else if (key === 'Delete') {
            if (this.caretIndex < txt.length) {
                const before = txt.slice(0, this.caretIndex)
                const after = txt.slice(this.caretIndex + 1)
                this.editingNode.text(before + after)
            }
        } else if (key === 'ArrowLeft') {
            this.caretIndex = Math.max(0, this.caretIndex - 1)
        } else if (key === 'ArrowRight') {
            this.caretIndex = Math.min(txt.length, this.caretIndex + 1)
        } else if (key === 'Enter') {
            const before = txt.slice(0, this.caretIndex)
            const after = txt.slice(this.caretIndex)
            this.editingNode.text(before + '\n' + after)
            this.caretIndex += 1
        } else if (key === 'Escape') {
            this.endInlineEditing(true)
        }

        // reposition caret according to caretIndex
        this.updateCaretPosition()
        this.layer.batchDraw()
        e.preventDefault()
        return
    }

    // Ignore key events that originate from form inputs or editable elements
    const tgt = e.target || {}
    const tag = tgt.tagName ? String(tgt.tagName).toLowerCase() : null
    if (tag === 'input' || tag === 'textarea' || tgt.isContentEditable) return

    const nodes = this.transformer.nodes() || []

    // Layer shortcuts
    if (nodes.length > 0) {
        if (e.key === ']' && e.ctrlKey && e.altKey) {
            e.preventDefault()
            this.bringToFront()
            return
        } else if (e.key === ']' && e.ctrlKey) {
            e.preventDefault()
            this.bringForward()
            return
        } else if (e.key === '[' && e.ctrlKey && e.altKey) {
            e.preventDefault()
            this.sendToBack()
            return
        } else if (e.key === '[' && e.ctrlKey) {
            e.preventDefault()
            this.sendBackward()
            return
        }
    }

    const resolveDeletionTarget = (node) => {
        let current = node
        let suggestionPart = null

        while (current) {
            const name = current && typeof current.name === 'function' ? String(current.name() || '') : ''
            if (name === 'suggestion-table') {
                return current
            }
            if (name === 'suggestion-table-part' && !suggestionPart) {
                suggestionPart = current
            }
            current = current && typeof current.getParent === 'function' ? current.getParent() : null
        }

        return suggestionPart || node
    }

    // Delete or Backspace should remove selected nodes
    if (e.key === 'Delete' || e.key === 'Backspace') {
        const nodes = this.transformer.nodes() || []
        if (nodes.length > 0) {
            // prevent browser navigation on Backspace
            e.preventDefault()
            const targets = []
            nodes.forEach(n => {
                const target = resolveDeletionTarget(n)
                if (target && !targets.includes(target)) {
                    targets.push(target)
                }
            })
            targets.forEach(n => {
                try { n.destroy() } catch (err) { /* ignore */ }
            })
            this.transformer.nodes([])
            this.layer.draw()
            this.saveHistory()
            try { this.emitSelectionChange() } catch (err) { /* ignore */ }
        }
    }
}