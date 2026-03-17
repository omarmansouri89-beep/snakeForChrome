// --- Elementen ---
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreDisplay = document.getElementById('score');
const gameOverOverlay = document.getElementById('gameOverOverlay');
const gameOverContent = document.getElementById('gameOverContent');
const scoresList = document.getElementById('scoresList');

// --- Spelinstellingen ---
const gridSize = 20;
const tileCount = canvas.width / gridSize;
let score = 0;
let gameInterval;
const MAX_HIGHSCORES = 10;

// --- Spelobjecten ---
let snake = [];
let velocity = { x: 0, y: 0 };
let nextVelocity = { x: 0, y: 0 };
let food = {};
let spider = null; // Kan een spin-object bevatten of null zijn
let spiderMoveCounter = 0;

// --- Highscore Logica (ongewijzigd) ---

function getHighscores() {
    const scores = localStorage.getItem('snakeHighscores');
    return scores ? JSON.parse(scores) : [];
}

function saveHighscores(scores) {
    localStorage.setItem('snakeHighscores', JSON.stringify(scores));
}

function checkAndDisplayHighscore() {
    const highscores = getHighscores();
    const isHighscore = highscores.length < MAX_HIGHSCORES || score > highscores[highscores.length - 1].score;
    gameOverOverlay.classList.remove('hidden');
    if (isHighscore) {
        gameOverContent.innerHTML = `
            <h2>Nieuwe Highscore!</h2>
            <p>Je score: ${score}</p>
            <p>Gefeliciteerd! Vul je naam in:</p>
            <input type="text" id="nameInput" placeholder="Je naam" maxlength="15">
            <button id="submitScoreButton">Opslaan</button>
        `;
        document.getElementById('submitScoreButton').onclick = () => {
            const name = document.getElementById('nameInput').value.trim() || "Anoniem";
            addHighscore(name, score);
            showNewGamePrompt();
        };
    } else {
        gameOverContent.innerHTML = `
            <h2>Game Over</h2>
            <p>Je score: ${score}</p>
            <p>Jammer, net geen top 10.</p>
            <button id="newGameButton">Nieuwe Game</button>
        `;
        document.getElementById('newGameButton').onclick = () => {
            gameOverOverlay.classList.add('hidden');
            resetGame();
        };
    }
}

function addHighscore(name, score) {
    let highscores = getHighscores();
    highscores.push({ name, score });
    highscores.sort((a, b) => b.score - a.score);
    if (highscores.length > MAX_HIGHSCORES) {
        highscores = highscores.slice(0, MAX_HIGHSCORES);
    }
    saveHighscores(highscores);
    renderHighscores();
}

function showNewGamePrompt() {
    gameOverContent.innerHTML = `
        <h2>Score Opgeslagen!</h2>
        <p>Start een nieuw spel.</p>
        <button id="newGameButton">Nieuwe Game</button>
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
        scoresList.innerHTML = '<li>Nog geen scores! Speel nu!</li>';
        return;
    }
    highscores.forEach((item, index) => {
        const li = document.createElement('li');
        li.innerHTML = `${index + 1}. ${item.name} <span>${item.score}</span>`;
        scoresList.appendChild(li);
    });
}

// --- Game Loop en Kernlogica ---

function gameLoop() {
    // 1. Beweging en Richting Updaten
    velocity = { ...nextVelocity };
    let head = { x: snake[0].x + velocity.x, y: snake[0].y + velocity.y };

    // 2. Botsingsdetectie (Game Over)
    if (
        velocity.x === 0 && velocity.y === 0 ||
        head.x < 0 || head.x >= tileCount ||
        head.y < 0 || head.y >= tileCount ||
        checkCollision(head, snake.slice(1))
    ) {
        if (!(velocity.x === 0 && velocity.y === 0)) {
            clearInterval(gameInterval);
            checkAndDisplayHighscore();
        }
        return;
    }

    // 3. Nieuwe kop toevoegen
    snake.unshift(head);

    // 4. Eten oppakken
    let ateSomething = false;
    // Eet normaal/gouden voedsel
    if (head.x === food.x && head.y === food.y) {
        score += food.points;
        ateSomething = true;
        placeFood();
    }
    // Eet de spin
    if (spider && head.x === spider.x && head.y === spider.y) {
        score += 5;
        ateSomething = true;
        spider = null; // Verwijder de spin
    }
    
    if (ateSomething) {
        scoreDisplay.textContent = score;
    } else {
        snake.pop(); // Verwijder staart als er niets gegeten is
    }

    // 5. Spin logica
    // Laat een spin verschijnen als er geen is en de score > 5
    if (!spider && score > 5 && Math.random() < 0.02) {
        placeSpider();
    }
    // Beweeg de spin
    if (spider) {
        moveSpider();
    }

    // 6. Tekenen
    drawGame();
}

function startGame() {
    clearInterval(gameInterval);
    const speed = 150 - Math.min(score, 100) * 1.2; // Iets aangepaste snelheidscurve
    gameInterval = setInterval(gameLoop, speed);
}


// --- Tekenfuncties ---

function drawGame() {
    // Achtergrond
    ctx.fillStyle = '#c2b280';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Voedsel tekenen
    ctx.fillStyle = food.color;
    ctx.shadowColor = 'rgba(0,0,0,0.5)';
    ctx.shadowBlur = 8;
    ctx.fillRect(food.x * gridSize, food.y * gridSize, gridSize, gridSize);
    ctx.shadowBlur = 0; // Reset schaduw

    // Spin tekenen
    if (spider) {
        const centerX = spider.x * gridSize + gridSize / 2;
        const centerY = spider.y * gridSize + gridSize / 2;
        ctx.fillStyle = '#333';
        // Lichaam
        ctx.beginPath();
        ctx.arc(centerX, centerY, gridSize / 2.5, 0, 2 * Math.PI);
        ctx.fill();
        // Poten
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        for (let i = 0; i < 8; i++) {
             ctx.beginPath();
             ctx.moveTo(centerX, centerY);
             const angle = (Math.PI / 4) * i;
             ctx.lineTo(centerX + Math.cos(angle) * gridSize, centerY + Math.sin(angle) * gridSize);
             ctx.stroke();
        }
    }

    // Slang tekenen
    snake.forEach((segment, index) => {
        const centerX = segment.x * gridSize + gridSize / 2;
        const centerY = segment.y * gridSize + gridSize / 2;

        if (index === 0) { // De kop
            const gradient = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, gridSize / 1.5);
            gradient.addColorStop(0, '#38761d');
            gradient.addColorStop(1, '#274e13');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(centerX, centerY, gridSize / 1.8, 0, 2 * Math.PI);
            ctx.fill();
            
            // Ogen
            drawEyes(centerX, centerY);

        } else { // Het lichaam
            const gradient = ctx.createRadialGradient(centerX, centerY, 1, centerX, centerY, gridSize / 2);
            gradient.addColorStop(0, '#93c47d');
            gradient.addColorStop(1, '#38761d');
            ctx.fillStyle = gradient;

            ctx.beginPath();
            ctx.arc(centerX, centerY, gridSize / 2, 0, 2 * Math.PI);
            ctx.fill();
        }
    });
}

function drawEyes(centerX, centerY) {
    const eyeOffsetX = velocity.x * (gridSize / 5);
    const eyeOffsetY = velocity.y * (gridSize / 5);
    const eyeRadius = gridSize / 8;

    ctx.fillStyle = 'white';
    // Oog 1
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetY - (gridSize / 5), centerY + eyeOffsetX - (gridSize / 5), eyeRadius, 0, 2 * Math.PI);
    ctx.fill();
    // Oog 2
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetY - (gridSize / 5), centerY - eyeOffsetX - (gridSize / 5), eyeRadius, 0, 2 * Math.PI);
    ctx.fill();

    ctx.fillStyle = 'black';
     // Pupil 1
    ctx.beginPath();
    ctx.arc(centerX - eyeOffsetY - (gridSize / 5) + (velocity.x * 2), centerY + eyeOffsetX - (gridSize / 5) + (velocity.y * 2), eyeRadius/2, 0, 2 * Math.PI);
    ctx.fill();
    // Pupil 2
    ctx.beginPath();
    ctx.arc(centerX + eyeOffsetY - (gridSize / 5) + (velocity.x * 2), centerY - eyeOffsetX - (gridSize / 5) + (velocity.y * 2), eyeRadius/2, 0, 2 * Math.PI);
    ctx.fill();
}


// --- Hulplogica ---

function placeFood() {
    // 15% kans op een gouden appel, anders een normale
    if (Math.random() < 0.15) {
        food = {
            type: 'golden',
            points: 3,
            color: 'gold'
        };
    } else {
        food = {
            type: 'normal',
            points: 1,
            color: 'red'
        };
    }
    
    let newFoodPos;
    do {
        newFoodPos = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (checkCollision(newFoodPos, snake) || (spider && spider.x === newFoodPos.x && spider.y === newFoodPos.y));

    food.x = newFoodPos.x;
    food.y = newFoodPos.y;
}

function placeSpider() {
    let newSpiderPos;
    do {
        newSpiderPos = {
            x: Math.floor(Math.random() * tileCount),
            y: Math.floor(Math.random() * tileCount)
        };
    } while (checkCollision(newSpiderPos, snake) || (food && food.x === newSpiderPos.x && food.y === newSpiderPos.y));

    spider = newSpiderPos;
}

function moveSpider() {
    spiderMoveCounter++;
    // Beweeg de spin slechts eens in de 5 game ticks voor een rustiger effect
    if (spiderMoveCounter % 5 !== 0) {
        return;
    }

    const moves = [-1, 0, 1];
    let dx = moves[Math.floor(Math.random() * moves.length)];
    let dy = moves[Math.floor(Math.random() * moves.length)];

    // Voorkom dat de spin stilstaat als het kan bewegen
    if (dx === 0 && dy === 0) dx = 1;

    const newX = spider.x + dx;
    const newY = spider.y + dy;

    // Check of de nieuwe positie binnen het veld en niet op de slang is
    if (newX >= 0 && newX < tileCount && newY >= 0 && newY < tileCount && !checkCollision({x: newX, y: newY}, snake)) {
        spider.x = newX;
        spider.y = newY;
    }
}

function checkCollision(point, array) {
    return array.some(segment => segment.x === point.x && segment.y === point.y);
}

function resetGame() {
    snake = [{ x: 15, y: 15 }]; // Aangepaste startpositie voor groter veld
    velocity = { x: 0, y: 0 };
    nextVelocity = { x: 0, y: 0 };
    score = 0;
    scoreDisplay.textContent = score;
    spider = null; // Reset de spin
    placeFood();
    drawGame();
}

// --- Input (Pijltjestoetsen) (ongewijzigd) ---

document.addEventListener('keydown', (event) => {
    if (!gameOverOverlay.classList.contains('hidden')) {
        return;
    }
    
    switch (event.key) {
        case 'ArrowUp':
            if (velocity.y !== 1) nextVelocity = { x: 0, y: -1 };
            break;
        case 'ArrowDown':
            if (velocity.y !== -1) nextVelocity = { x: 0, y: 1 };
            break;
        case 'ArrowLeft':
            if (velocity.x !== 1) nextVelocity = { x: -1, y: 0 };
            break;
        case 'ArrowRight':
            if (velocity.x !== -1) nextVelocity = { x: 1, y: 0 };
            break;
    }

    if (velocity.x === 0 && velocity.y === 0 && (nextVelocity.x !== 0 || nextVelocity.y !== 0)) {
        startGame();
    }
    
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
        event.preventDefault();
    }
});

// --- Initialisatie ---
resetGame();
renderHighscores();