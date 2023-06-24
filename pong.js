// Paddle dimensions
const paddleWidth = 100;
const paddleHeight = 20;
// Ball dimensions
const ballSize = 15;
// Speeds
const ballSpeed = 10;
const paddleSpeed = 20;
const topAI = true; // Set to true if you want the top paddle to be AI-controlled

let playerPaddle, aiPaddle, ball;

// Runs once at the start
function setup() {
    createCanvas(windowWidth, windowHeight).id("canvas");
    // Initialize player, AI paddles and ball
    playerPaddle = new Paddle(paddleWidth, paddleHeight, paddleSpeed, !topAI);
    aiPaddle = new Paddle(paddleWidth, paddleHeight, paddleSpeed, topAI);
    ball = new Ball(ballSize, ballSpeed);
}

// Runs every frame
function draw() {
    background(0); // black
    // Display and move paddles
    playerPaddle.display();
    playerPaddle.move(ball);
    aiPaddle.display();
    aiPaddle.move(ball);
    // Display and move ball
    ball.display();
    ball.move();
    // Check ball collisions
    ball.checkCollision(playerPaddle, aiPaddle);
}

// Resize canvas when window size changes
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

// Global variable to store touch position
var touchPosition = {
    x: null,
    y: null
};

// Add an event listener for touchstart event
document.addEventListener('touchstart', handleTouchStart, false);

// Add an event listener for touchend event
document.addEventListener('touchend', handleTouchEnd, false);

// Function to handle touchstart event
function handleTouchStart(event) {
    // Get the first touch object
    var touch = event.touches[0];

    // Update touch position
    touchPosition.x = touch.clientX;
    touchPosition.y = touch.clientY;
}

// Function to handle touchend event
function handleTouchEnd(event) {
    // Reset touch position
    touchPosition.x = null;
    touchPosition.y = null;
}

// Paddle class
class Paddle {
    constructor(w, h, s, isPlayer) {
        this.w = w;
        this.h = h;
        this.speed = s;
        this.isPlayer = isPlayer;
        this.x = windowWidth / 2 - w / 2; // Center horizontally
        this.y = isPlayer ? 0 : windowHeight - h; // Top for player, bottom for AI
    }

    display() {
        fill(0, 255, 0); // bright green
        rect(this.x, this.y, this.w, this.h);
    }

    move(ball) {
        // Player control
        if (this.isPlayer) {
            if ((keyIsDown(LEFT_ARROW) || (touchPosition.x !== null && touchPosition.x < windowWidth / 2)) && this.x > 0) {
                this.x -= this.speed;
            }
            if ((keyIsDown(RIGHT_ARROW) || (touchPosition.x !== null && touchPosition.x > windowWidth / 2)) && this.x < windowWidth - this.w) {
                this.x += this.speed;
            }
        } 
        // AI control
        else {
            let predictedX;
            if (ball.vy * (this.y < windowHeight / 2 ? 1 : -1) < 0) {
                predictedX = ball.x;
            } else {
                predictedX = ball.x + ((this.y < windowHeight / 2 ? 1 : -1) * (this.y - ball.y) * ball.vx / ball.vy);
                while (predictedX < 0 || predictedX > windowWidth - ball.s) {
                    if (predictedX < 0) {
                        predictedX = -predictedX;
                    }
                    if (predictedX > windowWidth - ball.s) {
                        predictedX = 2 * (windowWidth - ball.s) - predictedX;
                    }
                }
            }
            if (predictedX < this.x) {
                this.x -= Math.min(this.speed, this.x - predictedX);
            }
            if (predictedX + ball.s > this.x + this.w) {
                this.x += Math.min(this.speed, (predictedX + ball.s) - (this.x + this.w));
            }
        }
    }
}

// Ball class
class Ball {
    constructor(s, v) {
        this.s = s;
        this.initialSpeed = v; // keep track of the initial speed
        this.vx = v;
        this.vy = v;
        this.speedIncrement = 1; // you can adjust this value
        this.reset(); // call reset to set initial position
    }

    reset() {
        this.x = windowWidth / 2 - this.s / 2; // Center horizontally
        this.y = windowHeight / 2 - this.s / 2; // Center vertically
        this.vx = this.initialSpeed * (Math.random() < .5 ? 1 : -1);
        this.vy = this.initialSpeed * (Math.random() < .5 ? 1 : -1);
    }

    display() {
        fill(0, 255, 0); // white
        rect(this.x, this.y, this.s, this.s);
    }

    move() {
        this.x += this.vx;
        this.y += this.vy;

        // Bounce off walls
        if (this.x < 0 || this.x > windowWidth - this.s) {
            this.vx *= -1;
        }

        // If it hits the top or bottom, reset game
        if (this.y < 0 || this.y > windowHeight - this.s) {
            this.reset(); // reset ball position
        }
    }

    // Check if ball collides with a paddle
    checkCollision(playerPaddle, aiPaddle) {
        if (
            this.y <= playerPaddle.h && this.x + this.s > playerPaddle.x && this.x < playerPaddle.x + playerPaddle.w ||
            this.y + this.s >= windowHeight - aiPaddle.h && this.x + this.s > aiPaddle.x && this.x < aiPaddle.x + aiPaddle.w
        ) {
            this.vy *= -1;
            this.vx += this.vx < 0 ? -this.speedIncrement : this.speedIncrement; // increase speed after each bounce
            this.vy += this.vy < 0 ? -this.speedIncrement : this.speedIncrement;
        }
    }
}
