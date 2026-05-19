export default function clear() {
    if (!this.layer) return
    this.layer.destroyChildren()
    this.createStage()
}