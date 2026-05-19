export default function bringForward() {
    const nodes = this.transformer.nodes()
    if (nodes.length) {
        nodes.forEach(n => n.moveUp())
        this.transformer.moveToTop()
        this.layer.draw()
        this.saveHistory()
    }
}