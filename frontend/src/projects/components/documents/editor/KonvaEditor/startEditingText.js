export default function startEditingText(konvaText) {
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
        if (apply) {
            try { this.saveHistory() } catch (e) { /* ignore */ }
        }
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
}
