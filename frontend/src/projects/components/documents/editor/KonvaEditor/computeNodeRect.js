export default function computeNodeRect(node) {
    try {
        const r = node.getClientRect({ skipTransform: false })
        return {
            left: r.x,
            top: r.y,
            right: r.x + r.width,
            bottom: r.y + r.height,
            centerX: r.x + r.width / 2,
            centerY: r.y + r.height / 2,
            width: r.width,
            height: r.height,
        }
    } catch (err) {
        return null
    }
}
