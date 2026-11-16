document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
});

const scores = {win: 0, draw: 0, lose: 0};

const youIcon = document.getElementById("you-i");
const cpuIcon = document.getElementById("cpu-i");

const MOVES = ["rock", "paper", "scissors"];

// BEATEN_BY[m] is the move that beats m
const BEATEN_BY = { rock: "paper", paper: "scissors", scissors: "rock" };

// result from the player's point of view -> the computer's point of view
const OPPOSITE = { win: "lose", lose: "win", draw: "draw" };

// order-1 Markov chain: transitions[prev][next] = how often the player
// played `next` right after `prev`
let transitions;
let lastPlayerMove;

function initModel() {
    transitions = {};
    for (const from of MOVES) {
        transitions[from] = {};
        for (const to of MOVES) {
            transitions[from][to] = 0;
        }
    }
    lastPlayerMove = null;
}

function setStatus(text) {
    document.getElementById("status-text").textContent = text;
}

function addScore(key) {
    scores[key]++;
    document.getElementById(`result-${key}`).textContent = scores[key];
}

const capitalize = (word) => word[0].toUpperCase() + word.slice(1);

function resetGame() {
    initModel();
    scores.win = scores.draw = scores.lose = 0;
    for (const key in scores) {
        document.getElementById(`result-${key}`).textContent = 0;
    }
    youIcon.innerHTML = "";
    cpuIcon.innerHTML = "";
    youIcon.classList.remove("win", "lose", "draw");
    cpuIcon.classList.remove("win", "lose", "draw");
    setStatus("Select Rock, Paper, or Scissors to play!");
}

const svg = (inner) => `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
     stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  ${inner}
</svg>`;

const ICONS = {
    rock: svg(`
        <path d="M11.264 2.205A4 4 0 0 0 6.42 4.211l-4 8a4 4 0 0 0 1.359 5.117l6 4a4 4 0 0 0 4.438 0l6-4a4 4 0 0 0 1.576-4.592l-2-6a4 4 0 0 0-2.53-2.53z"/>
        <path d="M11.99 22 14 12l7.822 3.184"/>
        <path d="M14 12 8.47 2.302"/>
    `),
    paper: svg(`
        <path d="M21 9a2.4 2.4 0 0 0-.706-1.706l-3.588-3.588A2.4 2.4 0 0 0 15 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2z"/>
        <path d="M15 3v5a1 1 0 0 0 1 1h5"/>
    `),
    scissors: svg(`
        <circle cx="6" cy="6" r="3"/>
        <path d="M8.12 8.12 12 12"/>
        <path d="M20 4 8.12 15.88"/>
        <circle cx="6" cy="18" r="3"/>
        <path d="M14.8 14.8 20 20"/>
    `)
};

function randomMove() {
    return MOVES[Math.floor(Math.random() * MOVES.length)];
}

// returns the predicted next player move, or null if there's no data yet
function predictPlayerMove() {
    if (lastPlayerMove === null) return null;          // no history yet

    const row = transitions[lastPlayerMove];
    const max = Math.max(...Object.values(row));
    if (max === 0) return null;                        // never seen this row

    const candidates = MOVES.filter((m) => row[m] === max);
    return candidates[Math.floor(Math.random() * candidates.length)];
}

function chooseComputerMove() {
    const predicted = predictPlayerMove();
    return predicted === null ? randomMove() : BEATEN_BY[predicted];
}

function learn(playerMove) {
    if (lastPlayerMove !== null) {
        transitions[lastPlayerMove][playerMove]++;
    }
    lastPlayerMove = playerMove;
}

// "win", "draw" or "lose", from the player's point of view
function getResult(playerMove, computerMove) {
    if (playerMove === computerMove) return "draw";
    return BEATEN_BY[computerMove] === playerMove ? "win" : "lose";
}

function setOutcome(element, outcome) {
    element.classList.remove("win", "lose", "draw");
    element.classList.add(outcome);
}

function play(playerMove) {
    const computerMove = chooseComputerMove();   // decide first...
    learn(playerMove);                           // ...then update the model

    youIcon.innerHTML = ICONS[playerMove];
    cpuIcon.innerHTML = ICONS[computerMove];

    const result = getResult(playerMove, computerMove);
    addScore(result);
    setOutcome(youIcon, result);
    setOutcome(cpuIcon, OPPOSITE[result]);

    const you = capitalize(playerMove);
    const cpu = capitalize(computerMove);
    const messages = {
        win: `${you} beats ${cpu}. You win!`,
        draw: `Both played ${you}. It's a draw.`,
        lose: `${cpu} beats ${you}. You lose.`
    };
    setStatus(messages[result]);

    console.log(transitions);                    // watch it learn
}

MOVES.forEach((move) => {
    document.getElementById(move).addEventListener("click", () => play(move));
});

resetGame();