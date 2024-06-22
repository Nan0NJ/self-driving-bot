import Controls from "./controls";
import Sensor from "./sensor";
import {polysIntersection} from "./utils";
import NeuralNetwork from "./network";

class Car {
    // Setting position of the car
    public x: number;
    public y: any;
    // Setting width and height of the car
    private readonly width: number;
    private readonly height: number;

    private speed: number;
    private readonly acceleration: number;
    private readonly maxSpeed: number;
    private readonly friction: number;
    public angle: number;

    private controls: Controls;
    private sensor: Sensor;

    // polygon is the shape of the car
    public polygon: any[];
    public damaged: boolean;

    // useNetwork determines whether the car uses a neural network to drive
    public brain: NeuralNetwork;
    private useAI: boolean;

    constructor(x: number, y: number, width: number, height: number, controlledCar: string = "DUMMY", maxSpeed: number = 3) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.speed = 0;
        this.acceleration = 0.2;
        this.maxSpeed = maxSpeed;
        this.friction = 0.05;
        this.angle = 0;

        this.damaged = false;

        this.useAI = controlledCar == "SELF";

        // If the car is controllable, create a sensor for it
        if (controlledCar != "DUMMY") {
            this.sensor = new Sensor(this);
            this.brain = new NeuralNetwork([this.sensor.rayCount, 6, 4])
        }

        this.controls = new Controls(controlledCar);

        this.polygon = this.createPolygon();
        
    }

    // Function update updates car position and checks for damage
    public update(roadBorders: any[], traffic: Car[]) {
        // If the car is damaged, don't update its position
        if (!this.damaged) {
            this.move()
            this.polygon = this.createPolygon()
            this.damaged = this.assessDamage(roadBorders, traffic)
        }
        // If the car has a sensor, update the sensor positions
        if (this.sensor) {
            // we read 3 things: x, y, offset | no reading return 0
            // 1 - offset because we want to know how far the car is from the road
            this.sensor.update(roadBorders, traffic)
            const offsets = this.sensor.readings.map(
                s => s == null ? 0 : 1 - s.offset
            )

            const outputs = NeuralNetwork.feedForward(offsets, this.brain)

            if (this.useAI) {
                // Use of basic logic to control the car
                this.controls.forward = outputs[0];
                this.controls.left = outputs[1];
                this.controls.right = outputs[2];
                this.controls.reverse = outputs[3];
                
            }

        }
    }
    // Function assessDamage checks if the car is damaged
    private assessDamage(roadBorders: any[], traffic: Car[]) {
        for (let i = 0; i < roadBorders.length; i++) {
            if (polysIntersection(this.polygon, roadBorders[i])) {
                return true
            }
        }

        for (let i = 0; i < traffic.length; i++) {
            if (polysIntersection(this.polygon, traffic[i].polygon)) {
                return true
            }
        }

        return false
    }
    // Create the polygon shape of the car
    private createPolygon() {
        const points = [];
        const rad = Math.hypot(this.width, this.height) / 2
        const alpha = Math.atan2(this.width, this.height)
        points.push({
            x: this.x - Math.sin(this.angle - alpha) * rad,
            y: this.y - Math.cos(this.angle - alpha) * rad
        })

        points.push({
            x: this.x - Math.sin(this.angle + alpha) * rad,
            y: this.y - Math.cos(this.angle + alpha) * rad
        })

        points.push({
            x: this.x - Math.sin(Math.PI + this.angle - alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle - alpha) * rad
        })

        points.push({
            x: this.x - Math.sin(Math.PI + this.angle + alpha) * rad,
            y: this.y - Math.cos(Math.PI + this.angle + alpha) * rad
        })

        return points
    }
    // Function move moves the car
    private move() {
        if (this.controls.forward) {
            this.speed += this.acceleration
        }
    
        if (this.controls.reverse) {
            this.speed -= this.acceleration
        }
    
        if (this.speed > this.maxSpeed) {
            this.speed = this.maxSpeed
        }
    
        if (this.speed < -this.maxSpeed) {
            this.speed = -this.maxSpeed / 2
        }
    
        if (this.speed > 0) {
            this.speed -= this.friction
        }
    
        if (this.speed < 0) {
            this.speed += this.friction
        }
    
        if (Math.abs(this.speed) < this.friction) {
            this.speed = 0
        }
    
        if (this.speed != 0) {
            const flip = this.speed > 0 ? 1 : -1
            if (this.controls.left) {
                this.angle += flip * .03
            }
    
            if (this.controls.right) {
                this.angle -= flip * .03
            }
        }
    
    
        this.x -= Math.sin(this.angle) * this.speed
        this.y -= Math.cos(this.angle) * this.speed
    }

    // Draws the car and its sensor ( if true )
    draw(ctx: CanvasRenderingContext2D, color: string, best: boolean = false) {
        // If the car is damaged, draw it in red = to appear as a hit
        if(this.damaged){
            if (best) {
                ctx.fillStyle="red";
            } else {
                ctx.fillStyle="rgba(255,0,0,.1)";
            }
        }else{
            ctx.fillStyle=color;
        }
        // Draw the car 
        ctx.beginPath();
        ctx.moveTo(this.polygon[0].x,this.polygon[0].y);
        for(let i=1;i<this.polygon.length;i++){
            ctx.lineTo(this.polygon[i].x,this.polygon[i].y);
        }
        ctx.fill()

        if (this.sensor && best) {
            this.sensor.draw(ctx)
        }
    }
}

export default Car;