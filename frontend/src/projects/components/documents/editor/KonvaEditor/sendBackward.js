export default function sendBackward() {
    const nodes = this.transformer.nodes()
    const bg = this.layer.children[0] // A4 white background 
    if (nodes.length) {
        nodes.forEach(n => {
            n.moveDown()
            // prevent moving below bg
            if (n.zIndex() <= bg.zIndex()) {
                n.zIndex(bg.zIndex() + 1)
            }
        })
        this.layer.draw()
        this.saveHistory()
    }
}