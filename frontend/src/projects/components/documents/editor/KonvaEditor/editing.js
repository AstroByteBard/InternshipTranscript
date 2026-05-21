import Konva from 'konva'

export default {
    getCaretIndexFromPointer(konvaText, pointerPos) {
        if (!pointerPos) return konvaText.text().length
        const padding = konvaText.padding() || 0
        const localX = pointerPos.x - konvaText.x() - padding
        const localY = pointerPos.y - konvaText.y() - padding
        const lines = konvaText.text().split('\n')
        const fontSize = konvaText.fontSize() || 16
        const lineHeight = (konvaText.lineHeight() || 1.2) * fontSize
        let lineIndex = Math.max(0, Math.min(lines.length - 1, Math.floor(localY / lineHeight)))
        // clamp
        if (lineIndex < 0) lineIndex = 0
        const line = lines[lineIndex] || ''
        // find char position within line by measuring widths
        let acc = 0
        let idxInLine = line.length
        for (let i = 0; i <= line.length; i++) {
            const substr = line.slice(0, i)
            const w = this.measureTextWidth(substr, fontSize, konvaText.fontFamily())
            if (w >= localX) {
                idxInLine = i
                break
            }
        }
        // compute global index
        let idx = 0
        for (let i = 0; i < lineIndex; i++) idx += lines[i].length + 1
        idx += idxInLine
        return Math.max(0, Math.min(konvaText.text().length, idx))
    },

    updateCaretPosition() {
        if (!this.editingNode || !this.caret) return
        const t = this.editingNode.text()
        const padding = this.editingNode.padding() || 0
        const fontSize = this.editingNode.fontSize() || 16
        const lines = t.split('\n')
        let idx = Math.max(0, Math.min(this.caretIndex || 0, t.length))
        // determine line and pos
        let lineIdx = 0
        let acc = 0
        for (let i = 0; i < lines.length; i++) {
            const nl = lines[i].length + 1
            if (idx <= acc + lines[i].length) {
                lineIdx = i
                break
            }
            acc += nl
        }
        const inLineIndex = idx - acc
        const substr = (lines[lineIdx] || '').slice(0, inLineIndex)
        const textWidth = this.measureTextWidth(substr, fontSize, this.editingNode.fontFamily())
        const x = this.editingNode.x() + padding + textWidth
        const y = this.editingNode.y() + padding + lineIdx * ((this.editingNode.lineHeight() || 1.2) * fontSize)
        this.caret.x(x)
        this.caret.y(y)
        this.caret.height(fontSize)
        this.layer.batchDraw()
    },

    startEditingText(konvaText) {
        if (this.inlineEditMode) {
            this.startInlineEditing(konvaText)
            return
        }

        const stage = this.stage
        const container = stage.container()
        const scale = stage.scaleX() || 1

        // remove any existing editor overlay to avoid stacking
        const existing = document.querySelector('.konva-textarea-editor')
        if (existing) existing.parentNode.removeChild(existing)

        // create textarea overlay
        const textarea = document.createElement('textarea')
        textarea.className = 'konva-textarea-editor'
        textarea.value = konvaText.text()

        // get absolute position of text on stage
        const textPos = konvaText.getAbsolutePosition()
        const stageBox = container.getBoundingClientRect()

        textarea.style.position = 'absolute'
        textarea.style.top = `${stageBox.top + textPos.y * scale}px`
        textarea.style.left = `${stageBox.left + textPos.x * scale}px`
        textarea.style.width = `${konvaText.width() * scale}px`
        textarea.style.height = `${konvaText.height() * scale}px`
        textarea.style.fontSize = `${konvaText.fontSize() * scale}px`
        textarea.style.fontFamily = konvaText.fontFamily() || 'sans-serif'
        textarea.style.color = konvaText.fill() || '#000'
        textarea.style.padding = '0'
        textarea.style.margin = '0'
        textarea.style.border = 'none'
        textarea.style.background = 'transparent'
        textarea.style.outline = 'none'
        textarea.style.zIndex = 1000
        textarea.style.resize = 'none'
        textarea.style.lineHeight = `${konvaText.lineHeight || 1.2}`
        textarea.style.whiteSpace = 'pre-wrap'
        textarea.style.overflow = 'hidden'

        document.body.appendChild(textarea)
        textarea.focus()
        // auto-size height to content
        const adjustHeight = () => {
            textarea.style.height = 'auto'
            textarea.style.height = `${Math.max(24, textarea.scrollHeight)}px`
        }
        adjustHeight()
        textarea.addEventListener('input', adjustHeight)

        const removeTextarea = (apply) => {
            if (apply) {
                const newText = textarea.value
                konvaText.text(newText)
                // keep width as textarea width scaled back to stage coords
                const newW = parseFloat(textarea.style.width) / scale
                konvaText.width(Math.max(1, Math.floor(newW)))
                // adjust font size back to stage coords
                const newFontSize = parseFloat(textarea.style.fontSize) / scale
                konvaText.fontSize(Math.max(8, Math.floor(newFontSize)))
            }
            textarea.parentNode && textarea.parentNode.removeChild(textarea)
            this.layer.draw()
            window.removeEventListener('scroll', onScroll)
        }

        const onKeydown = (e) => {
            if (e.key === 'Escape') {
                removeTextarea(false)
            } else if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                // commit on Ctrl+Enter / Cmd+Enter
                removeTextarea(true)
            }
        }

        const onScroll = () => {
            removeTextarea(true)
        }

        textarea.addEventListener('keydown', onKeydown)
        textarea.addEventListener('blur', () => removeTextarea(true))
        window.addEventListener('scroll', onScroll)
    },

    startInlineEditing(konvaText) {
        if (this.editingNode) this.endInlineEditing(true)
        this.editingNode = konvaText
        // create caret as a thin rect/line
        const fontSize = konvaText.fontSize() || 16
        const caret = new Konva.Rect({
            x: konvaText.x() + konvaText.width(),
            y: konvaText.y(),
            width: 1,
            height: fontSize,
            fill: 'black',
            listening: false,
            historyIgnore: true,
        })
        this.caret = caret
        this.layer.add(caret)

        const blink = () => {
            if (!this.caret) return
            this.caret.visible(!this.caret.visible())
            this.layer.batchDraw()
        }
        this.caretInterval = setInterval(blink, 480)
        this.caret.visible(true)
        // position caret at end by default
        this.caretIndex = konvaText.text().length
        this.updateCaretPosition()
        this.layer.draw()
    },

    endInlineEditing(commit = true) {
        if (!this.editingNode) return
        if (this.caret) {
            try { this.caret.destroy() } catch (e) { }
            this.caret = null
        }
        if (this.caretInterval) {
            clearInterval(this.caretInterval)
            this.caretInterval = null
        }
        this.editingNode = null
        this.layer.draw()
    }
}
