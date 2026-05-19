import Konva from 'konva'

export default function drawVerticalGuideLine(x, stageH) {
    const line = new Konva.Line({
        points: [x, 0, x, stageH],
        stroke: '#ef4444',
        strokeWidth: 1,
        dash: [6, 4],
        listening: false,
        opacity: 0.95,
    })
    this.guideLayer.add(line)
}
