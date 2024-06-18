import Car from "./modules/car";
import Road from "./modules/road";
import NeuralNetwork from "./modules/network";

const canvas : HTMLCanvasElement = document.getElementById('VechicleCanvas') as HTMLCanvasElement;

canvas.width = 300;

const ctx : CanvasRenderingContext2D = canvas.getContext('2d');

// Creation of Init Road Object
const road = new Road(canvas.width / 2, canvas.width * .94);
// Creation of Init Car Object - to test
// const bestCar = new Car(road.getLaneCenter(1), 100, 30, 50, "SELF", 3);

document.getElementById("carsCount").onchange = () => {
    localStorage.setItem('carsCount', (document.getElementById("carsCount") as HTMLInputElement).value);
    window.location.reload();
};

const cars: Car[] = generateCars(localStorage.getItem("carsCount") || 100);

const traffic = [
    new Car(road.getLaneCenter(1), -100, 50, 80),
    new Car(road.getLaneCenter(0), -400, 50, 80),
    new Car(road.getLaneCenter(2), -700, 50, 80),
    new Car(road.getLaneCenter(2), -1000, 50, 80),
    new Car(road.getLaneCenter(0), -1000, 50, 80),
    new Car(road.getLaneCenter(0), -1400, 50, 80),
    new Car(road.getLaneCenter(1), -1600, 50, 80),
    new Car(road.getLaneCenter(1), -2100, 50, 80),
    new Car(road.getLaneCenter(0), -2600, 50, 80),
    new Car(road.getLaneCenter(2), -2300, 50, 80),
    new Car(road.getLaneCenter(2), -3000, 50, 80),
]

let bestCar:Car = cars[0];

if(localStorage.getItem('bestBrain')){
    for (let i = 0;i<cars.length;i++){
        cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'))
        if(i!=0){
            NeuralNetwork.mutate(cars[i].brain,.2)
        }
    }
}

animate();

document.getElementById('#save').addEventListener('click', function() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
});

document.getElementById('discard').addEventListener('click', function() {
    localStorage.removeItem("bestBrain");
});

function generateCars(N){
    const cars=[];
    for(let i=1;i<=N;i++){
        cars.push(new Car(road.getLaneCenter(1),100,50,80,"SELF",4));
    }
    return cars;
}


function animate() {
    for(let i = 0;i<traffic.length;i++){
        traffic[i].update(road.borders,[])
    }

    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders,traffic);
    }
    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

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

