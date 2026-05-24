export default function measureTextWidth(text, fontSize, fontFamily) {
    try {
        const canvas = this._textMeasureCanvas || (this._textMeasureCanvas = document.createElement('canvas'))
        const ctx = canvas.getContext('2d')
        const normalizedFontFamily = String(fontFamily || '').split(',').map((family) => {
            const trimmed = family.trim()
            if (!trimmed) return trimmed
            return trimmed.includes(' ') && !trimmed.includes('"') && !trimmed.includes("'") ? `"${trimmed}"` : trimmed
        }).join(', ')
        ctx.font = `${fontSize}px ${normalizedFontFamily}`
        return ctx.measureText(text).width
    } catch (e) {
        return text.length * (fontSize * 0.6)
    }
}
