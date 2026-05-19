export default function bringToFront() {
    const nodes = this.transformer.nodes()
    if (nodes.length) {
        nodes.forEach(n => n.moveToTop())
        this.transformer.moveToTop()
        this.layer.draw()
        this.saveHistory()
    }
}