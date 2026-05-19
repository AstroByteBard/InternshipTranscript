export default function updateCaretPosition() {
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
}
