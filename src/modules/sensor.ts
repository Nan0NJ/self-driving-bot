import Car from "./car";
import {lerp, getIntersection} from "./utils";

export default class Sensor {
    private rays: any[];
    private rayLength: number;
    private raySpread: number;
    private car: Car;
    public rayCount: number;
    public readings: any[];

    constructor(car: Car) {
        this.car = car;
        this.rayCount = 8;
        this.rayLength = 300
        this.raySpread = Math.PI /4;

        this.rays = [];
        this.readings = [];
    }

    // updating the sensor readings based on the road borders and traffic
    update(roadBorders: any[], traffic: Car[]) {
        this.castRays();
        this.readings = [];
        for (let i = 0; i < this.rays.length; i++) {
            this.readings.push(
                this.getReading(this.rays[i], roadBorders, traffic)
            );
        }
    }

    // casting rays from the car to the road borders and traffic
    private castRays() {
        this.rays = []

        for (let i = 0; i < this.rayCount; i++) {
            const rayAngle = lerp(
                this.raySpread / 2,
                -this.raySpread / 2,
                this.rayCount == 1 ? 0.5 : i / (this.rayCount - 1)
            ) + this.car.angle

            const start = {x: this.car.x, y: this.car.y}

            const end = {
                x: this.car.x -
                    Math.sin(rayAngle) * this.rayLength,
                y: this.car.y -
                    Math.cos(rayAngle) * this.rayLength,
            }

            this.rays.push([start, end])
        }
    }

    // getting the closest reading from the rays to the road borders and traffic
    // used to determine the distance from the car to the road borders and traffic
    private getReading(ray: any, roadBorders: any[], traffic: Car[]) {
        let touches = [];

        for (let i = 0; i < roadBorders.length; i++) {
            const touch = getIntersection(
                ray[0],
                ray[1],
                roadBorders[i][0],
                roadBorders[i][1]
            );
            if (touch) {
                touches.push(touch);
            }
        }

        for (let i = 0;i<traffic.length;i++){
            const poly = traffic[i].polygon // ADDED LATER SEE BELOW
            for(let j= 0;j<poly.length;j++){
                const value = getIntersection(
                    ray[0],
                    ray[1],
                    poly[j],
                    poly[(j+1) % poly.length]
                )

                if(value){
                    touches.push(value)
                }
            }
        }

        // if we have touches, we return the closest one
        if (touches.length == 0) {
            return null;
        } else {
            const offsets = touches.map(e => e.offset);
            const minOffset = Math.min(...offsets);
            return touches.find(e => e.offset == minOffset);
        }
    }

    // drawing the rays on the canvas to visualize the sensor readings
    // determine movement based on the car
    draw(ctx: CanvasRenderingContext2D) {
        for (let i = 0; i < this.rayCount; i++) {
            let end = this.rays[i][1];

            if (this.readings[i]) {
                end = this.readings[i];
            }

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'yellow';
            ctx.moveTo(
                this.rays[i][0].x,
                this.rays[i][0].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();

            ctx.beginPath();
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'red';
            ctx.moveTo(
                this.rays[i][1].x,
                this.rays[i][1].y
            );
            ctx.lineTo(
                end.x,
                end.y
            );
            ctx.stroke();
        }
    }    
}