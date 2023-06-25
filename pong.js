let opPlayer = false;
let playerPaddle, aiPaddle, ball, paddleWidth, paddleHeight, paddleSpeed, ballSize, ballSpeed, aiNapTime;
let playerScore = 0;
let aiScore = 0;
let scoreColor;
let targetScoreColor;

function setup() {
    createCanvas(windowWidth, windowHeight).id("canvas");
    paddleWidth = windowWidth / 5;
    paddleHeight = windowWidth / 50;
    ballSize = windowWidth / 50;
    ballSpeed = (windowHeight + windowWidth) / 2 / 100;
    paddleSpeed = (windowHeight + windowWidth) / 2 / 50;

    playerPaddle = new Paddle(paddleWidth, paddleHeight, paddleSpeed, true);
    aiPaddle = new Paddle(paddleWidth, paddleHeight, paddleSpeed, false);
    ball = new Ball(ballSize, ballSpeed);
    scoreColor = color(0, 255, 0, 255);
    targetScoreColor = color(0, 255, 0, 255);
}

function draw() {
    background(0);
    playerPaddle.display();
    playerPaddle.move(ball);
    aiPaddle.display();
    aiPaddle.move(ball);
    ball.display();
    ball.move();
    ball.checkCollision(playerPaddle, aiPaddle);
    displayScore();
}

function displayScore() {
    scoreColor = lerpColor(scoreColor, targetScoreColor, 0.05);
    textAlign(CENTER, CENTER);
    textSize((windowHeight + windowWidth) / 2 / 25);
    fill(scoreColor);
    text("Player: " + playerScore + '\nAI: ' + aiScore + "\nFirst to three wins", windowWidth / 2, windowHeight / 2);
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

var touchPosition = {
    x: null,
    y: null
};

document.addEventListener('touchstart', handleTouchStart, false);
document.addEventListener('touchend', handleTouchEnd, false);

function handleTouchStart(event) {
    var touch = event.touches[0];
    touchPosition.x = touch.clientX;
    touchPosition.y = touch.clientY;
}

function handleTouchEnd(event) {
    touchPosition.x = null;
    touchPosition.y = null;
}

class Paddle {
    constructor(w, h, s, isPlayer) {
        this.targetX = 0
        this.w = w
        this.h = h
        this.napTime = 0
        this.speed = s
        this.isPlayer = isPlayer
        this.x = windowWidth / 2 - w / 2
        this.y = isPlayer ? 0 : windowHeight - h
    }

    display() {
        fill(0, 255, 0);
        rect(this.x, this.y, this.w, this.h);
    }

    move(ball) {
        if (this.isPlayer) {
            if (opPlayer) {
                this.x = ball.x - this.w / 2
            } else {
                if ((keyIsDown(LEFT_ARROW) || (touchPosition.x !== null && touchPosition.x < windowWidth / 2)) && this.x > 0) {
                    this.x -= this.speed;
                }
                if ((keyIsDown(RIGHT_ARROW) || (touchPosition.x !== null && touchPosition.x > windowWidth / 2)) && this.x < windowWidth - this.w) {
                    this.x += this.speed;
                }
            }
        } else {
            this.x += Math.min(Math.max((this.targetX - this.w / 2) - this.x, -this.speed), this.speed)
            this.x = Math.min(Math.max(this.x, 0), windowWidth - this.w)
        }
    }
}

function calculateBounce(vx, vy, cw, ch, bx, by) {
    let distance = vy < 0 ? by + ch : ch - by
    let predictedX = vx * (distance / Math.abs(vy)) + bx
    while (predictedX < 0 || predictedX > cw) {
        if (predictedX < 0) {
            predictedX = -predictedX
        } else if (predictedX > ch) {
            predictedX = cw - (predictedX - cw)
        }
    }
    return (predictedX)
}

class Ball {
    constructor(s, v) {
        this.s = s;
        this.initialSpeed = v;
        this.vx = v;
        this.vy = v;
        this.speedIncrement = 0;
        this.reset();
    }

    reset() {
        if (Math.random() < .1) {
            this.x = Math.random() * (windowWidth - this.s)
            this.y = this.s / 2 + paddleHeight * 2
            this.vx = this.initialSpeed * (Math.random() < .5 ? 1 : -1)
            this.vy = this.initialSpeed
        } else {
            this.x = Math.random() * (windowWidth - this.s)
            this.y = windowHeight - this.s / 2 - paddleHeight * 2
            this.vx = this.initialSpeed * (Math.random() < .5 ? 1 : -1)
            this.vy = -this.initialSpeed
        }

        aiPaddle.napTime = 0
        aiPaddle.speed = paddleSpeed
        aiPaddle.targetX = calculateBounce(this.vx, this.vy, windowWidth, windowHeight, this.x, this.y)

        if (this.vy > 0) {
            playerScore++;
            targetScoreColor = color(0, 255, 0, 0);
        } else {
            aiScore++;
            targetScoreColor = color(0, 255, 0, 0);
        }

        scoreColor = color(0, 255, 0, 255);
    }

    display() {
        fill(0, 255, 0);
        rect(this.x, this.y, this.s, this.s)
    }

    move() {
        this.x += this.vx
        this.y += this.vy

        if (this.x < 0 || this.x > windowWidth - this.s) {
            this.vx *= -1
        }

        if (this.y < 0 || this.y > windowHeight - this.s) {
            this.reset()
            opPlayer = false
        }
    }

    checkCollision(playerPaddle, aiPaddle) {
        if (this.y <= playerPaddle.h && this.x + this.s > playerPaddle.x && this.x < playerPaddle.x + playerPaddle.w) {
            this.vy *= -1;
            this.vx += this.vx < 0 ? -this.speedIncrement : this.speedIncrement;
            this.vy += this.vy < 0 ? -this.speedIncrement : this.speedIncrement;
        }
        if (this.y + this.s >= windowHeight - aiPaddle.h && this.x + this.s > aiPaddle.x && this.x < aiPaddle.x + aiPaddle.w) {
            this.vy *= -1;
            setTimeout(() => {
                aiPaddle.targetX = calculateBounce(this.vx, this.vy, windowWidth, windowHeight, this.x, this.y)
            }, aiPaddle.napTime);
            aiPaddle.napTime += 100
            aiPaddle.speed *= .9
        }
    }
}
