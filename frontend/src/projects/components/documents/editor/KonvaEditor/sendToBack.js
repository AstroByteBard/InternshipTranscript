export default function sendToBack() {
    const nodes = this.transformer.nodes()
    const bg = this.layer.children[0]
    if (nodes.length) {
        nodes.forEach(n => {
            n.zIndex(bg.zIndex() + 1)
        })
        this.layer.draw()
        this.saveHistory()
    }
}