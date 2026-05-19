import Konva from 'konva'

export default function drawHorizontalGuideLine(y, stageW) {
    const line = new Konva.Line({
        points: [0, y, stageW, y],
        stroke: '#ef4444',
        strokeWidth: 1,
        dash: [6, 4],
        listening: false,
        opacity: 0.95,
    })
    this.guideLayer.add(line)
}
