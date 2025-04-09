// plinko.js
import { getRandomInt, easeInOutQuad } from './utils.js';

const canvas = document.getElementById('plinkoCanvas');
const ctx = canvas.getContext('2d');

// Canvas dimensions
canvas.width = 800;
canvas.height = 600;

// Variables
let ballRadius = 10;
let ballX = canvas.width / 2;
let ballY = 0;
let ballSpeed = 5;
let ballDirection = 0; // Random direction
let pegs = [];
let slots = [];
let betAmount = 0;
let balance = 100; // Initial balance
let resultElement = document.getElementById('result');

// Update balance in UI
function updateBalance(newBalance) {
    balance = newBalance;
    document.getElementById('balance').value = newBalance.toFixed(2);
}

// Generate pegs
function generatePegs() {
    pegs = [];
    let x = ballRadius * 2;
    let y = 40;

    for (let row = 0; row < 16; row++) {
        let pegCount = row % 2 === 0 ? row + 1 : row;
        let startX = row % 2 === 0 ? ballRadius * 2 : ballRadius * 3;

        for (let i = 0; i < pegCount; i++) {
            pegs.push({ x: startX + i * (ballRadius * 4), y: y });
        }

        y += 40;
    }
}

// Generate slots
function generateSlots() {
    slots = [];
    const slotWidth = canvas.width / 11;
    const multipliers = [0.5, 1, 1.5, 2, 3, 5, 10, 15, 20, 25, 50];

    for (let i = 0; i < 11; i++) {
        slots.push({
            x: i * slotWidth,
            multiplier: multipliers[i],
        });
    }
}

// Draw pegs
function drawPegs() {
    ctx.fillStyle = '#fff'; // White color for the pegs
    pegs.forEach((peg) => {
        ctx.beginPath();
        ctx.arc(peg.x, peg.y, 5, 0, Math.PI * 2); // Small white circles for pegs
        ctx.fill();
    });
}

// Draw slots
function drawSlots() {
    slots.forEach((slot, index) => {
        ctx.fillStyle = '#aaa'; // Light gray background for slots
        ctx.fillRect(slot.x, canvas.height - 50, canvas.width / 11, 50);

        ctx.fillStyle = 'red'; // Red text for multipliers
        ctx.font = '20px Arial';
        ctx.fillText(`${slot.multiplier}x`, slot.x + canvas.width / 22, canvas.height - 25);
    });
}

// Draw ball
function drawBall() {
    ctx.fillStyle = '#ff0'; // Yellow color for the ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, ballRadius, 0, Math.PI * 2);
    ctx.fill();
}

// Ball physics
function moveBall() {
    ballY += ballSpeed;

    // Check collision with pegs
    pegs.forEach((peg) => {
        const dx = ballX - peg.x;
        const dy = ballY - peg.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < ballRadius + 5) {
            ballDirection = Math.random() > 0.5 ? 1 : -1; // Change direction
        }
    });

    // Apply direction
    ballX += ballDirection * ballSpeed * 0.5;

    // Boundary check
    if (ballX < ballRadius || ballX > canvas.width - ballRadius) {
        ballDirection *= -1;
    }
}

// Check if ball has landed in a slot
function checkSlotCollision() {
    if (ballY >= canvas.height - 50) {
        const slotIndex = Math.floor(ballX / (canvas.width / 11));
        const multiplier = slots[slotIndex].multiplier;
        const winnings = betAmount * multiplier;

        resultElement.innerHTML = `<p>You won ${winnings.toFixed(2)}!</p>`;
        updateBalance(balance + winnings - betAmount);
        return true;
    }
    return false;
}

// Reset game state
function resetGame() {
    ballX = canvas.width / 2;
    ballY = 0;
    ballDirection = 0;
    betAmount = parseFloat(document.getElementById('betAmount').value);
    resultElement.innerHTML = '';
}

// Main game loop
function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawPegs();
    drawSlots();
    drawBall();

    moveBall();

    if (checkSlotCollision()) {
        clearInterval(gameInterval);
    }

    requestAnimationFrame(gameLoop);
}

// Event listeners
document.getElementById('startGame').addEventListener('click', () => {
    betAmount = parseFloat(document.getElementById('betAmount').value);
    if (isNaN(betAmount) || betAmount <= 0 || betAmount > balance) {
        alert('Please enter a valid bet amount.');
        return;
    }

    resetGame();
    gameInterval = setInterval(gameLoop, 1000 / 60); // 60 FPS
});

document.getElementById('resetGame').addEventListener('click', () => {
    resetGame();
    resultElement.innerHTML = '';
});

// Initialize game
generatePegs();
generateSlots();
updateBalance(balance);
