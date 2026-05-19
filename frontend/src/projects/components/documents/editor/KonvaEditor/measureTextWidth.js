export default function measureTextWidth(text, fontSize, fontFamily) {
    try {
        const canvas = this._textMeasureCanvas || (this._textMeasureCanvas = document.createElement('canvas'))
        const ctx = canvas.getContext('2d')
        ctx.font = `${fontSize}px ${fontFamily}`
        return ctx.measureText(text).width
    } catch (e) {
        return text.length * (fontSize * 0.6)
    }
}
