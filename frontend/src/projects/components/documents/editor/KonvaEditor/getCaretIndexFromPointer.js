export default function getCaretIndexFromPointer(konvaText, pointerPos) {
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
}
