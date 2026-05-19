export default function onResize() {
    if (!this.stage) return
    // Stage size is FIXED to A4 (794x1123). 
    // Scaling is handled by the parent container's CSS transform.
    this.layer.batchDraw()
}
