import {lerp} from "./utils";

export default class Road {
    // x is the CENTER of the road
    private x: number;
    // laneCount is the number of lanes on the road - we set it to 3 by default
    private laneCount: number;
    // width is the WIDTH of the road
    private width: number;

    // left and right, top and bottom are the left and right bounds of the road
    private left: number;
    private right: number;
    private top: number;
    private bottom: number;

    // borders are the borders of the road
    public borders: any[];

    constructor(x: number, width: number, laneCount: number = 3) {
        this.x = x
        this.width = width
        this.laneCount = laneCount

        this.left = this.x - width / 2
        this.right = this.x + width / 2

        const infinity = 10000000
        this.top = -infinity
        this.bottom = infinity

        const topLeft = {x: this.left, y: this.top}
        const topRight = {x: this.right, y: this.top}
        const bottomLeft = {x: this.left, y: this.bottom}
        const bottomRight = {x: this.right, y: this.bottom}

        this.borders = [
            [topLeft, bottomLeft],
            [topRight, bottomRight],
        ]
    }

    draw(ctx: CanvasRenderingContext2D) {
        // We set the color of the road 
        ctx.lineWidth = 5
        ctx.strokeStyle = 'white'

        // Draw the road lines
        for (let i = 1; i <= this.laneCount - 1; i++) {
            const x = lerp(
                this.left,
                this.right,
                i / this.laneCount
            )

            // Draw the dashed lines
            ctx.setLineDash([20, 20])

            ctx.beginPath()
            ctx.moveTo(x, this.top)
            ctx.lineTo(x, this.bottom)
            ctx.stroke()
        }

        ctx.setLineDash([])
        // Draw the borders of the road
        this.borders.forEach(border => {
            ctx.beginPath()
            ctx.moveTo(border[0].x, border[0].y)
            ctx.lineTo(border[1].x, border[1].y)
            ctx.stroke()
        })
    }

    // Get the center of the lane
    getLaneCenter(laneIndex) {
        const laneWidth = this.width / this.laneCount
        return this.left + laneWidth / 2 + Math.min(laneIndex, this.laneCount - 1) * laneWidth
    }
}