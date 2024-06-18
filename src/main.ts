import Car from "./modules/car";
import Road from "./modules/road";

const canvas : HTMLCanvasElement = document.getElementById('VechicleCanvas') as HTMLCanvasElement;

canvas.width = 300;

const ctx : CanvasRenderingContext2D = canvas.getContext('2d');

// Creation of Init Road Object
const road = new Road(canvas.width / 2, canvas.width * .94);
// Creation of Init Car Object - to test
const bestCar = new Car(road.getLaneCenter(1), 100, 30, 50, "SELF", 3);

const traffic = [
    new Car(road.getLaneCenter(0), -100, 30, 50, "DUMMY", 2)
]

animate();

function animate() {
    for(let i = 0;i<traffic.length;i++){
        traffic[i].update(road.borders,[])
    }

    bestCar.update(road.borders, traffic);

    canvas.height = window.innerHeight;

    ctx.save();
    ctx.translate(0, -bestCar.y + canvas.height * .8)

    road.draw(ctx);

    for(let i=0;i<traffic.length;i++){
        traffic[i].draw(ctx, "yellow");
    }

    bestCar.draw(ctx, "blue");

    ctx.restore();
    requestAnimationFrame(animate);
}

