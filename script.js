// --- Elementen ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const gameOverContent = document.getElementById('gameOverContent');
const scoresList = document.getElementById('scoresList');

// --- Audio Elementen ---
const bgMusic = document.getElementById('bgMusic');
const muteButton = document.getElementById('muteButton');
let audioCtx; 
bgMusic.volume = 0.3; 

// --- Spelinstellingen ---
const gridSize = 20; 
const tileCount = canvas.width / gridSize;
let score = 0;
let gameInterval; 
const MAX_HIGHSCORES = 10;

let snake = [];
let velocity = { x: 0, y: 0 }; 
let nextVelocity = { x: 0, y: 0 }; 
let food = {};
let particles = [];

// --- NIEUW: 5 Verschillende Snoepjes (Neon Kleuren) ---
const candies = [
    { color: '#ff3366' }, // Roze
    { color: '#33ccff' }, // Blauw
    { color: '#ffea00' }, // Geel
    { color: '#cc33ff' }, // Paars
    { color: '#ff9900' }  // Oranje
];

// --- Mute Knop Logica ---
muteButton.addEventListener('click', () => {
    if (bgMusic.paused) {
        bgMusic.play();
        muteButton.textContent = "🔊 Muziek Aan/Uit";
    } else {
        bgMusic.pause();
        muteButton.textContent = "🔇 Muziek Aan/Uit";
    }
    muteButton.blur(); 
});

// --- Geluidseffecten ---
function playSound(type) {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (bgMusic.paused && bgMusic.currentTime > 0) return;

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    if (type === 'eat') {
        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(600, audioCtx.currentTime + 0.1);
        gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
    } else if (type === 'die') {
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(150, audioCtx.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(50, audioCtx.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.3);
    }
}

// --- Particle Systeem (Neemt nu snoepjes-kleur over) ---
class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 10;
        this.vy = (Math.random() - 0.5) * 10;
        this.life = 1.0; 
        this.color = color; // Kleur is nu dynamisch
    }
    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= 0.05; 
    }
    draw(ctx) {
        ctx.globalAlpha = Math.max(0, this.life); 
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0; 
    }
}

function createExplosion(x, y, color) {
    for (let i = 0; i < 15; i++) {
        particles.push(new Particle(x * gridSize + gridSize/2, y * gridSize + gridSize/2, color));
    }
}

// --- Highscore Logica ---
function getHighscores() { return JSON.parse(localStorage.getItem('snakeHighscores')) || []; }
function saveHighscores(scores) { localStorage.setItem('snakeHighscores', JSON.stringify(scores)); }

function checkAndDisplayHighscore() {
    const highscores = getHighscores();
    const isHighscore = highscores.length < MAX_HIGHSCORES || score > (highscores[highscores.length - 1]?.score || 0);

    gameOverOverlay.classList.remove('hidden');

    if (isHighscore) {
        gameOverContent.innerHTML = `
            <h2 style="color: #00ff80;">Nieuwe Highscore!</h2>
            <p>Je score: ${score}</p>
            <input type="text" id="nameInput" placeholder="Je naam" maxlength="15" style="padding:10px; width:80%; margin-bottom:10px;">
            <br><button id="submitScoreButton" style="padding:10px 20px; cursor:pointer; font-weight:bold; border:none; border-radius:5px; background-color:#00ff80; color:#121212;">Opslaan</button>
        `;
        document.getElementById('submitScoreButton').onclick = () => {
            const name = document.getElementById('nameInput').value.trim() || "Anoniem";
            addHighscore(name, score);
            showNewGamePrompt(); 
        };
    } else {
        showNewGamePrompt();
    }
}

function addHighscore(name, score) {
    let highscores = getHighscores();
    highscores.push({ name, score });
    highscores.sort((a, b) => b.score - a.score);
    if (highscores.length > MAX_HIGHSCORES) highscores = highscores.slice(0, MAX_HIGHSCORES);
    saveHighscores(highscores);
    renderHighscores();
}

function showNewGamePrompt() {
    gameOverContent.innerHTML = `
        <h2 style="color: #ff3366;">Game Over</h2>
        <p>Je score was: ${score}</p>
        <button id="newGameButton" style="padding:10px 20px; cursor:pointer; font-weight:bold; border:none; border-radius:5px; background-color:#333; color:white;">Nieuwe Game</button>
    `;
    document.getElementById('newGameButton').onclick = () => {
        gameOverOverlay.classList.add('hidden');
        resetGame();
    };
}

function renderHighscores() {
    const highscores = getHighscores();
    scoresList.innerHTML = ''; 
    if (highscores.length === 0) {
        scoresList.innerHTML = '<li>Nog geen scores!</li>';
        return;
    }
    highscores.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `<span>${index + 1}. ${item.name}</span> <span style="color:#00ff80">${item.score}</span>`;
        scoresList.appendChild(li);
    });
}

// --- Game Loop ---
function gameLoop() {
    velocity = { ...nextVelocity };
    let head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    if (
        (velocity.x === 0 && velocity.y === 0) || 
        head.x < 0 || head.x >= tileCount || 
        head.y < 0 || head.y >= tileCount || 
        checkCollision(head, snake.slice(1)) 
    ) {
        if (!(velocity.x === 0 && velocity.y === 0)) {
            clearInterval(gameInterval); 
            playSound('die'); 
            checkAndDisplayHighscore();
        }
        return; 
    }

    snake.unshift(head);

    if (head.x === food.x && head.y === food.y) {
        score++;
        scoreDisplay.textContent = score;
        playSound('eat'); 
        
        // Geef de kleur van het gegeten snoepje door aan de explosie!
        createExplosion(food.x, food.y, candies[food.type].color); 
        placeFood();

        // NIEUW: Snelheid verhogen per 5 punten
        if (score % 5 === 0) {
            startGame(); // Herstart het interval met de nieuwe, hogere snelheid
        }
    } else {
        snake.pop();
    }

    drawGame();
}

function startGame() {
    clearInterval(gameInterval); 
    
    // NIEUW: Snelheidslogica
    // Start op 200ms (lekker traag). Elke 5 punten doen we de tijd * 0.9 (dus 10% sneller).
    const level = Math.floor(score / 5);
    let speed = 200 * Math.pow(0.9, level);
    
    // Zorg dat het nooit onspeelbaar snel wordt (maximaal 60ms)
    speed = Math.max(60, speed); 
    
    gameInterval = setInterval(gameLoop, speed);
}

// --- Tekenfuncties ---
function drawGame() {
    ctx.fillStyle = '#1e1e1e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bepaal welk snoepje er getekend moet worden
    const currentCandy = candies[food.type];

    ctx.shadowBlur = 15;
    ctx.shadowColor = currentCandy.color;
    ctx.fillStyle = currentCandy.color;
    ctx.beginPath();
    ctx.arc(food.x * gridSize + gridSize/2, food.y * gridSize + gridSize/2, gridSize/2 - 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#00ff80';
    snake.forEach((segment, index) => {
        ctx.fillStyle = index === 0 ? '#00ffaa' : '#00cc66'; 
        ctx.beginPath();
        ctx.roundRect(segment.x * gridSize + 1, segment.y * gridSize + 1, gridSize - 2, gridSize - 2, 4);
        ctx.fill();
    });

    ctx.shadowBlur = 0;

    particles.forEach((p, index) => {
        p.update();
        p.draw(ctx);
        if (p.life <= 0) particles.splice(index, 1); 
    });
}

function placeFood() {
    let newFood;
    do {
        newFood = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount),
            // Kies een willekeurig getal van 0 tot 4 voor het type snoepje
            type: Math.floor(Math.random() * candies.length) 
        };
    } while (checkCollision(newFood, snake));
    food = newFood;
}

function checkCollision(point, array) {
    return array.some(segment => segment.x === point.x && segment.y === point.y);
}

function resetGame() {
    snake = [{ x: 10, y: 10 }];
    velocity = { x: 0, y: 0 };
    nextVelocity = { x: 0, y: 0 };
    score = 0;
    particles = []; 
    scoreDisplay.textContent = score;
    placeFood();
    drawGame();
}

// --- Input ---
document.addEventListener('keydown', (event) => {
    if (!gameOverOverlay.classList.contains('hidden')) return;
    
    switch (event.key) {
        case 'ArrowUp': if (velocity.y !== 1) nextVelocity = { x: 0, y: -1 }; break;
        case 'ArrowDown': if (velocity.y !== -1) nextVelocity = { x: 0, y: 1 }; break;
        case 'ArrowLeft': if (velocity.x !== 1) nextVelocity = { x: -1, y: 0 }; break;
        case 'ArrowRight': if (velocity.x !== -1) nextVelocity = { x: 1, y: 0 }; break;
    }

    if (velocity.x === 0 && velocity.y === 0 && (nextVelocity.x !== 0 || nextVelocity.y !== 0)) {
        startGame();
        if (bgMusic.paused) {
            bgMusic.play().catch(e => console.log("Audio play prevented by browser policy"));
        }
    }
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) event.preventDefault();
});

resetGame();
renderHighscores();
