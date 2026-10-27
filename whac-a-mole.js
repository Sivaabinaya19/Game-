let grid = document.querySelector('.grid');
let timeLeft = document.querySelector('#time-left');
let score = document.querySelector('#score');
let startBtn = document.querySelector('#start-button');
let stopBtn = document.querySelector('#stop-button');
let gamePopup = document.querySelector('#game-popup');
let finalScore = document.querySelector('#final-score');
let playAgainBtn = document.querySelector('#play-again');
let closeBtn = document.querySelector('#close');
let highScoreDisplay = document.querySelector('#high-score');
let highScore = Number(localStorage.getItem('moleHighScore')) || 0;


let isRunning = false;
let result = 0;
let gameTimer = 30;
let moleTimer = null;
let gameTimerId = null;
let gridSize = 3;
let moleIds = new Set();
highScoreDisplay.textContent = highScore;
function getMoleCount() {
    if (result >= 20) return 3;
    if (result >= 10) return 2;
    return 1;
}

function createGrid(size) {
    gridSize = size;
    grid.innerHTML = '';
    grid.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

    for (let i = 1; i <= size * size; i++) {
        let square = document.createElement('div');
        square.classList.add('square');
        square.id = `square-${i}`;
        grid.appendChild(square);
    }
}

function updateLevel() {
    let newSize = 3;

    if (result >= 20) {
        newSize = 5;
    } else if (result >= 10) {
        newSize = 4;
    }

    if (newSize !== gridSize) {
        createGrid(newSize);
    }
}

function clearMoles() {
    document.querySelectorAll('.square').forEach(square => {
        square.classList.remove('mole');
        square.innerHTML = '';
    });

    moleIds.clear();
}

function randomSquare() {
    clearMoles();

    let squares = [...document.querySelectorAll('.square')];
    let moleCount = getMoleCount();

    for (let i = squares.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [squares[i], squares[j]] = [squares[j], squares[i]];
    }

    for (let i = 0; i < moleCount; i++) {
        let square = squares[i];
        square.classList.add('mole');
        let img = document.createElement('img');
        img.src = 'Images/%E2%80%94Pngtree%E2%80%94mole%20animal%20cartoon%20illustration_15369511.png';
        img.alt = 'Mole';
        square.appendChild(img);
        moleIds.add(square.id);
    }
}

function moveTheMole() {
    if (isRunning) return;

    isRunning = true;
    randomSquare();
    moleTimer = setInterval(randomSquare, 2000);
}

function countdown() {
    gameTimer--;
    timeLeft.textContent = gameTimer;

    if (gameTimer <= 0) {
        endGame();
    }
}
function updateHighScore() {
    if (result > highScore) {
        highScore = result;
        localStorage.setItem('moleHighScore', highScore);
        highScoreDisplay.textContent = highScore;
    }
}

function endGame() {
    isRunning = false;
    clearInterval(moleTimer);
    clearInterval(gameTimerId);
    clearTimeout(boosterTimer);
    moleTimer = null;
    gameTimerId = null;
    boosterTimer = null;
    clearMoles();
    updateHighScore();
    finalScore.textContent = result;
    gamePopup.style.display = 'flex';
}
function resetGame() {
    isRunning = false;
    clearInterval(moleTimer);
    clearInterval(gameTimerId);
    clearTimeout(boosterTimer);
    moleTimer = null;
    gameTimerId = null;
    boosterTimer = null;
    result = 0;
    gameTimer = 30;
    boosterUsed = false;
    doubleScore = false;
    score.textContent = 0;
    timeLeft.textContent = 30;
    finalScore.textContent = 0;
    boosterBtn.disabled = true;
    boosterStatus.textContent = 'Reach 10 points to unlock!';
    gamePopup.style.display = 'none';
    createGrid(3);
    clearMoles();
}


function startGame() {
    resetGame();
    moveTheMole();
    gameTimerId = setInterval(countdown, 1000);
}

grid.addEventListener('click', function(event) {
    if (!isRunning) return;

    let square = event.target.closest('.square');

    if (!square || !moleIds.has(square.id)) return;

    moleIds.delete(square.id);
    square.classList.remove('mole');
    square.innerHTML = '';

    result += doubleScore ? 2 : 1;
    score.textContent = result;

    updateLevel();
    updateBooster();
    score.textContent = result;

    updateLevel();

    if (gridSize !== 3 && result === 10 ||
        gridSize === 5 && result === 20) {
        randomSquare();
    } else if (moleIds.size === 0) {
        randomSquare();
    }
});

startBtn.addEventListener('click', function() {
    if (isRunning) return;

    if (gameTimer <= 0) {
        resetGame();
    }

    moveTheMole();
    gameTimerId = setInterval(countdown, 1000);
});

let boosterBtn = document.querySelector('#booster-btn');
let boosterStatus = document.querySelector('#booster-status');

let boosterUsed = false;
let doubleScore = false;
let boosterTimer = null;

function updateBooster() {
    if (result >= 10 && !boosterUsed) {
        boosterBtn.disabled = false;
        boosterStatus.textContent = 'Booster unlocked! Activate now.';
    }
}

boosterBtn.addEventListener('click', function() {
    if (!isRunning || boosterUsed || result < 10) return;
    boosterUsed = true;
    doubleScore = true;
    boosterBtn.disabled = true;
    boosterStatus.textContent = '⚡ Double score active!';
    boosterTimer = setTimeout(function() {
        doubleScore = false;
        boosterStatus.textContent = 'Booster finished!';
    }, 5000);
});

window.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        let confirmMsg = confirm("Are you sure you want to refresh?");
        if (confirmMsg) {
            window.location.reload();
        }
    }
});


stopBtn.addEventListener('click', resetGame);

playAgainBtn.addEventListener('click', startGame);
closeBtn.addEventListener('click', function () {
    gamePopup.style.display = 'none'
});
document.addEventListener("DOMContentLoaded", () => {
    document.body.style.visibility = "visible";
});
createGrid(3);