document.getElementById("theme-toggle").addEventListener("click", () => {
    document.documentElement.classList.toggle("dark");
});

const scores = {win: 0, draw: 0, lose: 0};

function setStatus(text) {
    document.getElementById("status-text").textContent = text;
}

function addScore(key) {
    scores[key]++;
    document.getElementById(`result-${key}`).textContent = scores[key];
}

function resetGame() {
    // reset game state goes here
}

document.getElementById("reset-button").addEventListener("click", resetGame);

resetGame();