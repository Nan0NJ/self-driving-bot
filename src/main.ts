import Car from "./modules/car";

const canvas : HTMLCanvasElement = document.getElementById('VechicleCanvas') as HTMLCanvasElement;

canvas.width = 300;

const ctx : CanvasRenderingContext2D = canvas.getContext('2d');

const car = new Car(100, 100, 30, 50);

animate();

function animate() {
    car.update();

    canvas.height = window.innerHeight;

    car.draw(ctx);
    requestAnimationFrame(animate);
}

