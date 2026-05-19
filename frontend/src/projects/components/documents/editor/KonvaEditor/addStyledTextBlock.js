export default function addStyledTextBlock(type) {
    let text = 'Text Block'
    let fontSize = 16
    let fontWeight = 'normal'

    if (type === 'h1') {
        text = 'Heading 1'
        fontSize = 32
        fontWeight = 'bold'
    } else if (type === 'h2') {
        text = 'Heading 2'
        fontSize = 24
        fontWeight = 'bold'
    } else if (type === 'h3') {
        text = 'Heading 3'
        fontSize = 18
        fontWeight = 'bold'
    } else if (type === 'paragraph') {
        text = 'Paragraph'
        fontSize = 16
        fontWeight = 'normal'
    }

    return this.addTextBlock(text, { fontSize, fontWeight }).then((node) => {
        try { this.startInlineEditing(node) } catch (e) { /* ignore */ }
        return node
    })
}