import Konva from 'konva'

export default function startInlineEditing(konvaText) {
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
}
