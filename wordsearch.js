let levels = {
    1: { rows: 6, cols: 6, wordCount: 5, name: "Easy", time: 60 },
    2: { rows: 8, cols: 8, wordCount: 10, name: "Medium", time: 180 },
    3: { rows: 12, cols: 12, wordCount: 16, name: "Hard", time: 240 }
};
let wordBank = {
    Nature: [
        "FOREST", "JUNGLE", "MOUNTAIN", "VALLEY", "RIVER",
        "WATERFALL", "DESERT", "FLOWER", "GARDEN", "SUNRISE",
        "SUNSET", "RAINBOW", "THUNDER", "BREEZE", "CLOUD",
        "OCEAN", "ISLAND", "VOLCANO", "RAIN", "AIR",
        "WATER", "FIRE", "LAND"
    ],
    Ocean: [
        "OCEAN", "WHALE", "SHARK", "DOLPHIN", "CORAL", "REEF",
        "OCTOPUS", "TURTLE", "SEASHELL", "JELLYFISH", "SEAL",
        "CRAB", "SQUID", "SEAHORSE", "STARFISH", "FISH"
    ],
    Animals: [
        "ELEPHANT", "GIRAFFE", "KANGAROO", "LEOPARD", "CHEETAH",
        "PENGUIN", "RABBIT", "MONKEY", "TIGER", "LION", "ZEBRA",
        "PANDA", "FOX", "WOLF", "EAGLE", "DOG", "CAT", "RAT",
        "PARROT", "PEACOCK", "BUTTERFLY", "SPIDER", "SQUIRREL"
    ],
    Space: [
        "PLANET", "GALAXY", "NEBULA", "ASTEROID", "COMET", "ROCKET",
        "SATELLITE", "ASTRONAUT", "TELESCOPE", "ORBIT", "JUPITER",
        "SATURN", "MERCURY", "VENUS", "MARS", "NEPTUNE", "URANUS",
        "COSMOS", "METEOR", "LUNAR", "EARTH"
    ],
    Sports: [
        "CRICKET", "FOOTBALL", "TENNIS", "HOCKEY", "BADMINTON",
        "VOLLEYBALL", "BASEBALL", "BASKETBALL", "CYCLING", "BOXING",
        "SWIMMING", "RUNNING", "SKATING", "GOLF", "RUGBY"
    ],
    Food: [
        "PIZZA", "BURGER", "NOODLES", "SANDWICH", "PANCAKE",
        "CHOCOLATE", "VANILLA", "POPCORN", "COOKIE", "CHEESE",
        "ORANGE", "BANANA", "PAPAYA", "PINEAPPLE", "COCONUT"
    ],
    Technology: [
        "COMPUTER", "KEYBOARD", "INTERNET", "SOFTWARE", "HARDWARE",
        "DATABASE", "PROGRAM", "BROWSER", "NETWORK", "DIGITAL",
        "PIXEL", "SERVER", "ROBOTICS", "CYBER", "MACHINE",
        "CIRCUIT", "ROBOT", "VOLTAGE", "GENETICS", "LASER"
    ],
    Fantasy: [
        "JOURNEY", "EXPLORE", "DISCOVER", "MYSTERY", "PUZZLE",
        "TREASURE", "CASTLE", "DRAGON", "KNIGHT", "WIZARD", "MAGIC",
        "LEGEND", "HERO", "DUNGEON", "KINGDOM", "CRYSTAL", "SPELL",
        "UNICORN", "PHOENIX", "GIANT"
    ]
};

let container = document.getElementById("container");
let set = document.getElementById("set");
let levelSelect = document.getElementById("levelSelect");
let categoryCards = document.querySelectorAll(".card");
let startBtn = document.getElementById("startBtn");
let closeBtn = document.getElementById("close");
let restartBtn = document.getElementById("restart");
let grid = document.getElementById("grid");
let wordsBox = document.getElementById("words");
let levelInfo = document.getElementById("levelInfo");
let categoryInfo = document.getElementById("categoryInfo");
let timerDisplay = document.getElementById("timer");
let gameScreen = document.querySelector(".game");

let directions = [
    [0, 1], [1, 0], [1, 1], [1, -1],
    [0, -1], [-1, 0], [-1, -1], [-1, 1]
];

let currentLevel = 1;
let currentCategory = "Nature";
let rows = levels[currentLevel].rows;
let cols = levels[currentLevel].cols;
let board = [];
let targetWords = [];
let foundWords = new Set();
let selection = [];
let dragging = false;
let gameActive = false;
let timerInterval = null;
let secondsLeft = 0;
let pointerId = null;
let popupContainer = document.getElementById("popupContainer");
let popupTitle = document.getElementById("popupTitle");
let popupMessage = document.getElementById("popupMessage");
let playAgainBtn = document.getElementById("playAgainBtn");
let popupCloseBtn = document.getElementById("popupCloseBtn");

categoryCards.forEach(card => {
    card.addEventListener("click", () => {
        if (gameActive) return;

        categoryCards.forEach(item => {
            item.classList.remove("selected");
        });

        card.classList.add("selected");
        currentCategory = card.dataset.category;
    });
});

function saveGame() {
    const gameData = {
        currentLevel,
        currentCategory,
        rows,
        cols,
        board,
        targetWords,
        foundWords: [...foundWords],
        secondsLeft,
        gameActive
    };

    localStorage.setItem("wordSearchGame",JSON.stringify(gameData));
}

function loadGame() {
    try {
        const savedData = localStorage.getItem("wordSearchGame");
        if (!savedData) return;
        const data = JSON.parse(savedData);
        currentLevel = data.currentLevel;
        currentCategory = data.currentCategory;
        rows = data.rows;
        cols = data.cols;
        board = data.board;
        targetWords = data.targetWords;
        foundWords = new Set(data.foundWords || []);
        secondsLeft = data.secondsLeft;
        levelSelect.value = currentLevel;
        categoryCards.forEach(card => {
            card.classList.toggle(
                "selected",
                card.dataset.category === currentCategory
            );
        });
    }
    catch (error) {
        console.error("Unable to load saved game:", error);
    }
}


function getRandomWords(count) {
    let shuffled = wordBank[currentCategory].filter(
        word => word.length <= Math.max(rows, cols)
    );

    for (let i = shuffled.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    return shuffled.slice(0, count);
}

function generateBoard() {
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let attempt = 0; attempt < 30; attempt++) {
        board = Array.from({ length: rows },() => Array(cols).fill(""));
        let shuffledWords = [...targetWords].sort(
            (a, b) => b.length - a.length
        );

        let allPlaced = true;

        for (let word of shuffledWords) {
            let placed = false;

            for (let tries = 0; tries < 1000 && !placed; tries++) {
                let [dr, dc] = directions[
                    Math.floor(Math.random() * directions.length)
                ];
                let r = Math.floor(Math.random() * rows);
                let c = Math.floor(Math.random() * cols);
                let endR = r + dr * (word.length - 1);
                let endC = c + dc * (word.length - 1);

                if (endR < 0 || endR >= rows ||endC < 0 || endC >= cols)
                {
                    continue;
                }
                let valid = true;
                for (let i = 0; i < word.length; i++) {
                    let letter = board[r + dr * i][c + dc * i];
                    if (letter && letter !== word[i]) {
                        valid = false;
                        break;
                    }
                }
                if (!valid) continue;
                for (let i = 0; i < word.length; i++) {
                    board[r + dr * i][c + dc * i] = word[i];
                }
                placed = true;
            }
            if (!placed) {
                allPlaced = false;
                break;
            }
        }
        if (allPlaced) {
            board = board.map(row =>
                row.map(letter =>
                    letter || alphabet[
                        Math.floor(Math.random() * alphabet.length)
                    ]
                )
            );
            return;
        }
    }
    targetWords = targetWords.filter(word => {
        return word.length <= Math.min(rows, cols);
    });
    generateBoardFallback();
}
function generateBoardFallback() {
    board = Array.from(
        { length: rows },
        () => Array(cols).fill("")
    );
    let alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let shuffledWords = [...targetWords].sort(
        (a, b) => b.length - a.length
    );
    for (let word of shuffledWords) {
        let placed = false;
        for (let tries = 0; tries < 1000 && !placed; tries++) {
            let [dr, dc] = directions[
                Math.floor(Math.random() * directions.length)
            ];
            let r = Math.floor(Math.random() * rows);
            let c = Math.floor(Math.random() * cols);
            let endR = r + dr * (word.length - 1);
            let endC = c + dc * (word.length - 1);
            if (endR < 0 || endR >= rows || endC < 0 || endC >= cols) continue;
            let valid = true;
            for (let i = 0; i < word.length; i++) {
                let letter = board[r + dr * i][c + dc * i];
                if (letter && letter !== word[i]) {
                    valid = false;
                    break;
                }
            }
            if (!valid) continue;
            for (let i = 0; i < word.length; i++) {
                board[r + dr * i][c + dc * i] = word[i];
            }
            placed = true;
        }
        if (!placed) {
            targetWords = targetWords.filter(item => item !== word);
        }
    }
    board = board.map(row =>
        row.map(letter =>
            letter || alphabet[
                Math.floor(Math.random() * alphabet.length)
            ]
        )
    );
}

function render() {
    grid.innerHTML = "";
    wordsBox.innerHTML = "";
    grid.style.gridTemplateColumns =
     `repeat(${cols}, minmax(0, 1fr))`;
    board.forEach((row, r) => {
        row.forEach((letter, c) => {
            let cell = document.createElement("div");
            cell.className = "cell";
            cell.textContent = letter;
            cell.dataset.r = r;
            cell.dataset.c = c;

            cell.addEventListener("pointerdown", startSelection);
            cell.addEventListener("pointerenter", enterCell);

            grid.appendChild(cell);
        });
    });

    targetWords.forEach(word => {
        let item = document.createElement("div");
        item.className = "word";
        item.textContent = word;
        item.dataset.word = word;
        wordsBox.appendChild(item);
    });
}

function getCell(r, c) {
    return grid.querySelector(
        `.cell[data-r="${r}"][data-c="${c}"]`
    );
}

function startSelection(e) {
    if (!gameActive || (e.pointerType === "mouse" && e.button !== 0)) {
        return;
    }
    e.preventDefault();
    dragging = true;
    pointerId = e.pointerId;
    clearSelection();
    addCell(e.currentTarget);
}
function enterCell(e) {
    if (!dragging || !gameActive) return;
    if (pointerId !== null && e.pointerId !== pointerId) return;

    addCell(e.currentTarget);
}

document.addEventListener("pointerup", e => {
    if (!dragging) return;
    if (pointerId !== null && e.pointerId !== pointerId) return;

    dragging = false;
    pointerId = null;
    checkWord();
});

document.addEventListener("pointercancel", () => {
    dragging = false;
    pointerId = null;
    clearSelection();
});

function addCell(cell) {
    if (!cell || !gameActive) return;

    let r = Number(cell.dataset.r);
    let c = Number(cell.dataset.c);

    if (selection.length === 0) {
        selection.push(cell);
        cell.classList.add("selected");
        return;
    }

    let first = selection[0];
    let r0 = Number(first.dataset.r);
    let c0 = Number(first.dataset.c);

    let drDiff = r - r0;
    let dcDiff = c - c0;

    if (drDiff === 0 && dcDiff === 0) return;

    if (
        drDiff !== 0 &&
        dcDiff !== 0 &&
        Math.abs(drDiff) !== Math.abs(dcDiff)
    ) {
        return;
    }

    let dr = Math.sign(drDiff);
    let dc = Math.sign(dcDiff);
    let distance = Math.max(
        Math.abs(drDiff),
        Math.abs(dcDiff)
    );

    let path = [];

    for (let i = 1; i <= distance; i++) {
        let next = getCell(r0 + dr * i, c0 + dc * i);

        if (!next) return;
        path.push(next);
    }

    clearSelection();

    selection.push(first);
    first.classList.add("selected");

    path.forEach(pathCell => {
        selection.push(pathCell);
        pathCell.classList.add("selected");
    });
}

function clearSelection() {
    selection.forEach(cell => {
        cell.classList.remove("selected");
    });

    selection = [];
}

function checkWord() {
    if (!selection.length || !gameActive) return;

    let text = selection.map(cell => cell.textContent).join("");
    let reversed = text.split("").reverse().join("");

    let word = targetWords.find(item =>
        !foundWords.has(item) &&
        (item === text || item === reversed)
    );

    if (!word) {
        clearSelection();
        return;
    }

    foundWords.add(word);
    saveGame();
    selection.forEach(cell => {
        cell.classList.remove("selected");
        cell.classList.add("found");
    });

    let wordItem = wordsBox.querySelector(
        `[data-word="${word}"]`
    );

    if (wordItem) {
        wordItem.classList.add("completed");
    }

    selection = [];

    if (foundWords.size === targetWords.length) {
        endGame(true);
    }
}

function startGame() {
    stopTimer();
    currentLevel = Number(levelSelect.value);
    let settings = levels[currentLevel];
    rows = settings.rows;
    cols = settings.cols;
    secondsLeft = settings.time;
    targetWords = getRandomWords(settings.wordCount);
    foundWords.clear();
    selection = [];
    dragging = false;
    pointerId = null;
    generateBoard();
    levelInfo.textContent = `Level ${currentLevel} - ${settings.name}`;
    categoryInfo.textContent = currentCategory;
    render();
    container.classList.add("hidden");
    set.classList.add("hidden");
    gameScreen.style.display = "block";
    playAgainBtn.addEventListener("click", () => {
        popupContainer.classList.add("hidden");
        startGame();
    });
    popupCloseBtn.addEventListener("click", () => {
        popupContainer.classList.add("hidden");
        closeGame();
    });
    gameActive = true;
    startTimer();
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(remainingSeconds).padStart(2, "0")}`;
}

function updateTimerDisplay() {
    timerDisplay.textContent = formatTime(secondsLeft);
    timerDisplay.classList.toggle("warning", secondsLeft <= 20);
}

function startTimer() {
    stopTimer();
    updateTimerDisplay();

    timerInterval = setInterval(() => {
        if (!gameActive) return;

        secondsLeft--;
        updateTimerDisplay();
        saveGame();
        if (secondsLeft <= 0) {
            secondsLeft = 0;
            updateTimerDisplay();
            endGame(false);
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval !== null) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}
function createConfetti() {
    const colors = ["#00f2fe","#7b2ff7","#22c55e","#facc15","#fb7185","#38bdf8"];
    for (let i = 0; i < 200; i++) {
        const piece = document.createElement("div");
        piece.className ="confetti";
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.background =colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration =(2 + Math.random() * 3) + "s";
        piece.style.animationDelay =Math.random() * 0.7 + "s";
        piece.style.transform =`rotate(${Math.random() * 360}deg)`;
        document.body.appendChild(piece);
        setTimeout(() => {piece.remove();}, 7000);
    }
}
function endGame(won) {
    if (!gameActive) return;
    gameActive = false;
    dragging = false;
    pointerId = null;
    stopTimer();
    clearSelection();
    grid.querySelectorAll(".cell").forEach(cell => {
        cell.style.cursor = "default";
    });
    if (won) {
        createConfetti();
        popupTitle.textContent = "🎉 Congratulations!";
        popupMessage.textContent =
            "Amazing! You found all the hidden words!";
        playAgainBtn.textContent = "Play Again";
        
    } else {
        popupTitle.textContent = "⏰ Time's Up!";
        popupMessage.textContent = `You found ${foundWords.size} out of ${targetWords.length} words. Try again!`;
        playAgainBtn.textContent = "Try Again";
    }
    popupContainer.classList.remove("hidden");
}

function closeGame() {
    gameActive = false;
    dragging = false;
    pointerId = null;
    stopTimer();
    clearSelection();
    gameScreen.style.display = "none";
    container.classList.remove("hidden");
    set.classList.remove("hidden");
}
window.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        let confirmMsg = confirm("Are you sure you want to refresh?");
        if (confirmMsg) {
            window.location.reload();
        }
    }
});

startBtn.addEventListener("click", startGame);
closeBtn.addEventListener("click", closeGame);
restartBtn.addEventListener("click", startGame);
loadGame();
set.classList.remove("hidden");
container.classList.remove("hidden");
gameScreen.style.display = "none";