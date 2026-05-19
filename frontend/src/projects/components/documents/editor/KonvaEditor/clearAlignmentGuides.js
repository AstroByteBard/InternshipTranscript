export default function clearAlignmentGuides() {
    if (!this.guideLayer) return
    this.guideLayer.destroyChildren()
    this.guideLayer.batchDraw()
}
