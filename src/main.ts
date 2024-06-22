import Car from "./modules/car";
import Road from "./modules/road";
import NeuralNetwork from "./modules/network";


// Canvas setup for Visual Vechicle Simulation
const canvas : HTMLCanvasElement = document.getElementById('VechicleCanvas') as HTMLCanvasElement;

canvas.width = 300;

const ctx : CanvasRenderingContext2D = canvas.getContext('2d');

// Creation of Init Road Object
const road = new Road(canvas.width / 2, canvas.width * .94);

// Creation of Init Car Object - to test
// FOR TESTING
// const bestCar = new Car(road.getLaneCenter(1), 100, 30, 50, "SELF", 3);


document.getElementById("carsCount").onchange = () => {
    localStorage.setItem('carsCount', (document.getElementById("carsCount") as HTMLInputElement).value);
    window.location.reload();
};

// Creation of Car Array Objects - to develop with the Genetic Algorithm
const cars: Car[] = generateCars(localStorage.getItem("carsCount") || 100);

// The Trainning Data / Set for the Neural Network - to develop 
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
];

// We initialize the bestCar with the first car in the array
let bestCar:Car = cars[0];

// If there is a bestBrain in the local storage, we load it 
// We simply mutate the other cars with a mutation rate of 0.2
if(localStorage.getItem('bestBrain')){
    for (let i = 0;i<cars.length;i++){
        cars[i].brain = JSON.parse(localStorage.getItem('bestBrain'))
        if(i!=0){ // We don't want to mutate the best car
            NeuralNetwork.mutate(cars[i].brain,.2)
        }
    }
}
// Pros and Cons to Higher or Lower Mutation Rate
/*
    - Higher Mutation Rate:
        - Increased Divrisity with Faster Evolution
        - Loss of obtained good solutions with too much randomness
    - Lower Mutation Rate:
        - We will have more stability with fine-tuning and prevent overfitting
        - Yet, we will have a slower evolution and a risk of getting stuck in some local optima which is not the best solution.
*/

animate();

// Save the best brain in the local storage
document.getElementById('save').addEventListener('click', function() {
    localStorage.setItem("bestBrain", JSON.stringify(bestCar.brain));
});

// Discard the best brain from the local storage
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

// Before drawing, ensure all objects in traffic are instances of Car
function isCarInstance(obj: any): obj is Car {
    return obj instanceof Car;
}

function animate() {
    // Update the traffic and the cars
    for(let i = 0;i<traffic.length;i++){
        if (isCarInstance(traffic[i])) {
            traffic[i].update(road.borders, []);
        }
    }

    for(let i=0;i<cars.length;i++){
        cars[i].update(road.borders, traffic);
        if (cars[i].damaged) {
            generateCars(Number(localStorage.getItem("carsCount") || 100) - cars.length);
        }
    }

    const allPassedAndOutOfView = traffic.every(car => car.y > bestCar.y + window.innerHeight);

    if (allPassedAndOutOfView) {
        traffic.length = 0; // Clear the traffic array correctly
        for (let i = 0; i < 10; i++) {
            if (Math.random() < 0.05) {
                generateTraffic(traffic, bestCar, road, canvas);
            }
        }
    }

    bestCar=cars.find(
        c=>c.y==Math.min(
            ...cars.map(c=>c.y)
        ));

    canvas.height = window.innerHeight;

    ctx.save();
    ctx.translate(0, -bestCar.y + canvas.height * .8)

    road.draw(ctx);

    // Draw the traffic and the cars
    for(let i=0;i<traffic.length;i++){
        if (isCarInstance(traffic[i])) {
            traffic[i].draw(ctx, "yellow");
        }
    }

    for(let i=0;i<cars.length;i++){
        cars[i].draw(ctx, "rgba(60,179,113,0.3)");
    }
    bestCar.draw(ctx, "rgba(60,188,71,1)", true);

    ctx.restore();
    requestAnimationFrame(animate);
}

// Generate traffic with a maximum of 10 cars
function generateTraffic(traffic: Array<Car>, car: Car, road: Road, canvas: HTMLCanvasElement) {
    if (traffic.length > 10) return;

    const laneIndex = Math.floor(Math.random() * 3); // This will generate 0, 1, or 2
    const xPos = road.getLaneCenter(laneIndex);

    const minimumSpawnDistance = 300;
    const yPos = car.y - minimumSpawnDistance;

    let isSpaceAvailable = true;
    traffic.forEach(tc => {
        if (tc.x === xPos && Math.abs(tc.y - yPos) < minimumSpawnDistance) {
            isSpaceAvailable = false;
        }
    });

    if (!isSpaceAvailable) return;

    // Adjust parameters to match Car constructor
    traffic.push(new Car(xPos, yPos, 50, 80));
}
