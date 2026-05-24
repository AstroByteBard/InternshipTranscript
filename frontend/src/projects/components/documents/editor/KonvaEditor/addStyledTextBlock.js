function getStyledTextLocaleLabels(locale) {
    const isThai = String(locale || 'th').toLowerCase().startsWith('th')

    return isThai
        ? {
            textBlock: 'บล็อกข้อความ',
            h1: 'หัวข้อ 1',
            h2: 'หัวข้อ 2',
            h3: 'หัวข้อ 3',
            paragraph: 'ย่อหน้า',
        }
        : {
            textBlock: 'Text Block',
            h1: 'Heading 1',
            h2: 'Heading 2',
            h3: 'Heading 3',
            paragraph: 'Paragraph',
        }
}

export default function addStyledTextBlock(type) {
    const labels = getStyledTextLocaleLabels(this.templateLocale)

    let text = labels.textBlock
    let fontSize = 16
    let fontWeight = 'normal'

    if (type === 'h1') {
        text = labels.h1
        fontSize = 32
        fontWeight = 'bold'
    } else if (type === 'h2') {
        text = labels.h2
        fontSize = 24
        fontWeight = 'bold'
    } else if (type === 'h3') {
        text = labels.h3
        fontSize = 18
        fontWeight = 'bold'
    } else if (type === 'paragraph') {
        text = labels.paragraph
        fontSize = 16
        fontWeight = 'normal'
    }

    return this.addTextBlock(text, { fontSize, fontWeight }).then((node) => {
        try { this.startInlineEditing(node) } catch (e) { /* ignore */ }
        return node
    })
}