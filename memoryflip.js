
let gameBoard = document.getElementById("gameBoard");
let timerDisplay = document.getElementById("timer");
let movesDisplay = document.getElementById("moves");
let bestScoreDisplay = document.getElementById("bestScore");
let restartBtn = document.getElementById("restartBtn");
let winMessage = document.getElementById("winMessage");
let finalTime = document.getElementById("finalTime");
let finalMoves = document.getElementById("finalMoves");
let newRecord = document.getElementById("newRecord");
let playAgain = document.getElementById("playAgain");
let close= document.getElementById("close")
let levelSelect = document.getElementById("level");
let set = document.getElementById("set");
let gamePanel = document.getElementById("gamePanel");
let startGameBtn = document.getElementById("startGame");
let backButton = document.getElementById("backButton");

let all = {
    Fruits: ["🍎", "🍌", "🍇", "🍉", "🍓", "🍒", "🍍", "🍅", "🥥", "🍋", "🍊", "🫐", "🍐", "🥝", "🍑", "🥭", "🍈", "🍏"],
    Animals: ["🐶", "🐱", "🦁", "🐯", "🐨", "🐼", "🐻", "🦊", "🐰", "🐵", "🐸", "🐔", "🐷", "🐮", "🐵", "🐧", "🦋", "🐢"],
    Flowers: ["🌸", "🌹", "🌺", "🌻", "🌼", "🌷", "🪻", "🌱", "🌲", "🌳", "🌴", "🌵", "🪷", "💐", "🪴", "🍀", "🌾", "🌿"],
    Sports: ["⚽", "🏀", "🏈", "⚾", "🥎", "🎾", "🏐", "🏉", "🥏", "🏓", "🏸", "🏒", "🥊", "⛳", "🏏", "🎳", "🛹", "🎯"],
    Ocean: ["🐬", "🐠", "🐙", "🦀", "🐳", "🪼", "🦈", "🐢", "🦭", "🦑", "🦞", "🐚", "🪸", "🐡", "🦐", "🦦", "🪿", "🌊"],
    Space: ["🌙", "🪐", "🚀", "⭐", "🌍", "☄️", "🌌", "🛸", "🌟", "🌞", "🌠", "👽", "🌑", "🛰️", "🌕", "🌎", "🌘", "✨"],
    Food: ["🍕", "🍩", "🍔", "🍟", "🍰", "🍪", "🌮", "🍿", "🍜", "🍦", "🥨", "🧁", "🍣", "🍉", "🥗", "🍫", "🥞", "🍞"],
    Hearts: ["❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "🤍", "🤎", "💖", "💕", "💗", "💓", "💞", "💘", "💝", "💟", "❣️"]
};

let levelPairs = {
    easy: 8,
    medium: 12,
    hard: 18
};

let selectedCategory = "Fruits";
let allEmojis = all[selectedCategory];
let emojis = allEmojis.slice(0, levelPairs[levelSelect.value]);

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matchedPairs = 0;
let seconds = 0;
let timerInterval = null;
let gameStarted = false;
let gameActive = false;

let bestScore = localStorage.getItem("memoryFlipBest");
bestScoreDisplay.textContent = bestScore ? `${bestScore} moves` : "--";

function formatTime(totalSeconds) {
    let minutes = Math.floor(totalSeconds / 60);
    let secs = totalSeconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function startTimer() {
    if (gameStarted || !gameActive) return;

    gameStarted = true;

    timerInterval = setInterval(() => {
        seconds++;
        timerDisplay.textContent = formatTime(seconds);
    }, 1000);
}

function shuffleCards(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        let j = Math.floor(Math.random() * (i + 1));
        [cards[i], cards[j]] = [cards[j], cards[i]];
    }

    return cards;
}

function createBoard() {
    gameBoard.innerHTML = "";
    gameBoard.className = "game-board";
    gameBoard.classList.add(levelSelect.value);

    let cardValues = shuffleCards([...emojis, ...emojis]);

    cardValues.forEach((emoji, index) => {
        let card = document.createElement("div");

        card.classList.add("card");
        card.dataset.emoji = emoji;
        card.dataset.index = index;

        card.innerHTML = `
            <div class="card-one">
                <div class="card-back">?</div>
                <div class="card-front">${emoji}</div>
            </div>
        `;

        card.addEventListener("click", () => flipCard(card));

        card.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                flipCard(card);
            }
        });

        gameBoard.appendChild(card);
    });
}

function flipCard(card) {
    if (
        !gameActive ||
        lockBoard ||
        card.classList.contains("flipped") ||
        card.classList.contains("matched")
    ) {
        return;
    }

    startTimer();

    card.classList.add("flipped");

    if (!firstCard) {
        firstCard = card;
        return;
    }

    secondCard = card;
    moves++;
    movesDisplay.textContent = moves;

    checkMatch();
}

function checkMatch() {
    let isMatch = firstCard.dataset.emoji === secondCard.dataset.emoji;

    if (isMatch) {
        firstCard.classList.add("matched");
        secondCard.classList.add("matched");
        matchedPairs++;
        resetTurn();

        if (matchedPairs === emojis.length) {
            endGame();
        }
    } else {
        lockBoard = true;

        let cardOne = firstCard;
        let cardTwo = secondCard;

        setTimeout(() => {
            cardOne.classList.remove("flipped");
            cardTwo.classList.remove("flipped");
            resetTurn();
        }, 1000);
    }
}

function resetTurn() {
    firstCard = null;
    secondCard = null;
    lockBoard = false;
}

function endGame() {
    clearInterval(timerInterval);
    timerInterval = null;
    gameActive = false;

    finalTime.textContent = formatTime(seconds);
    finalMoves.textContent = moves;

    let savedBest = localStorage.getItem("memoryFlipBest");
    let previousBest = savedBest ? Number(savedBest) : Infinity;

    if (moves < previousBest) {
        localStorage.setItem("memoryFlipBest", moves);
        bestScoreDisplay.textContent = `${moves} moves`;
        newRecord.textContent = "🏆 New Best Score!";
    } else {
        newRecord.textContent = "Great job! ✨";
    }

    winMessage.classList.add("show");
    createConfetti();
}

function createConfetti() {
    let colors = ["#00f2fe", "#7b2ff7", "#22c55e", "#facc15", "#fb7185", "#38bdf8"];

    for (let i = 0; i < 100; i++) {
        let piece = document.createElement("div");

        piece.className = "confetti";
        piece.style.left = Math.random() * 100 + "vw";
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        piece.style.animationDuration = (2 + Math.random() * 3) + "s";
        piece.style.animationDelay = Math.random() * 0.7 + "s";
        piece.style.transform = `rotate(${Math.random() * 360}deg)`;

        document.body.appendChild(piece);
        setTimeout(() => piece.remove(), 6000);
    }
}

function restartGame() {
    clearInterval(timerInterval);

    firstCard = null;
    secondCard = null;
    lockBoard = false;
    moves = 0;
    matchedPairs = 0;
    seconds = 0;
    gameStarted = false;
    timerInterval = null;
    gameActive = true;

    movesDisplay.textContent = "0";
    timerDisplay.textContent = "00:00";

    winMessage.classList.remove("show");
    newRecord.textContent = "";

    bestScore = localStorage.getItem("memoryFlipBest");
    bestScoreDisplay.textContent = bestScore ? `${bestScore} moves` : "--";

    emojis = allEmojis.slice(0, levelPairs[levelSelect.value]);

    createBoard();
}

function showGame() {
    set.hidden = true;
    gamePanel.hidden = false;
    restartGame();
}

function showSetup() {
    clearInterval(timerInterval);
    timerInterval = null;
    gameStarted = false;
    gameActive = false;
    gamePanel.hidden = true;
    set.hidden = false;
}

document.querySelectorAll(".category").forEach(button => {
    button.addEventListener("click", () => {
        let selectedButton = document.querySelector(".category.selected");
        if (selectedButton !== null) {
            selectedButton.classList.remove("selected");
        }
        button.classList.add("selected");
        selectedCategory = button.dataset.category;
        allEmojis = all[selectedCategory];
        if (!gamePanel.hidden) {
            restartGame();
        }
    });
});

levelSelect.addEventListener("change", () => {
    emojis = allEmojis.slice(0, levelPairs[levelSelect.value]);

    if (!gamePanel.hidden) {
        restartGame();
    }
});
startGameBtn.addEventListener("click", showGame);
backButton.addEventListener("click", showSetup);
restartBtn.addEventListener("click",restartGame);
playAgain.addEventListener("click", restartGame);
close.addEventListener("click", () => {
    winMessage.classList.remove("show");
});
gamePanel.hidden = true;

window.addEventListener("keydown", function (event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'r') {
        event.preventDefault();
        let confirmMsg = confirm("Are you sure you want to refresh?");
        if (confirmMsg) {
            window.location.reload();
        }
    }
});

createBoard();