import csv
import random
import sys

MOVES = ["rock", "paper", "scissors"]
ALIASES = {"rock": "rock", "r": "rock", "0": "rock",
           "paper": "paper", "p": "paper", "1": "paper",
           "scissors": "scissors", "s": "scissors", "2": "scissors"}


def parse_line(line):
    moves = []
    for tok in line.replace(",", " ").lower().split():
        if tok in ALIASES:
            moves.append(ALIASES[tok])
        elif set(tok) <= set("rps"):           
            moves += [ALIASES[c] for c in tok]
    return moves


def predict(counts, last):
    """Most common move the player has played after `last`, or None."""
    if last is None:
        return None
    row = counts[last]
    best = max(row.values())
    if best == 0:
        return None
    return random.choice([m for m in MOVES if row[m] == best]) 


def main(src, out="predictions.csv"):
    random.seed(0)                              
    with open(src) as f:
        games = [g for g in map(parse_line, f) if g]

    rows = []
    for g, moves in enumerate(games, 1):
        counts = {a: dict.fromkeys(MOVES, 0) for a in MOVES}  
        last = None
        for r, move in enumerate(moves, 1):
            guess = predict(counts, last)                      
            rows.append([g, r, move, guess or "",
                         "" if guess is None else int(guess == move)])
            if last is not None:                            
                counts[last][move] += 1
            last = move

    with open(out, "w", newline="") as f:
        w = csv.writer(f)
        w.writerow(["game", "round", "player_move", "predicted", "correct"])
        w.writerows(rows)

    scored = [r for r in rows if r[4] != ""]
    hits = sum(r[4] for r in scored)
    print(f"{len(games)} games, {len(rows)} moves, wrote {out}")
    if scored:
        print(f"accuracy {hits}/{len(scored)} = {hits / len(scored):.1%} "
              f"(random play would be 33.3%)")


if __name__ == "__main__":
    main(*sys.argv[1:3])