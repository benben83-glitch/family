"use client";

import { useState } from "react";

type Mark = "lion" | "croco";
type Cell = Mark | null;

const PLAYERS: Record<Mark, { emoji: string; label: string }> = {
  lion: { emoji: "🦁", label: "Lion" },
  croco: { emoji: "🐊", label: "Crocodile" },
};

const LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getResult(board: Cell[]): { winner: Mark; line: number[] } | { winner: null; line: null } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Mark, line };
    }
  }
  if (board.every((cell) => cell !== null)) return { winner: null, line: null };
  return null;
}

export function MorpionGame() {
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState<Mark>("lion");
  const [firstPlayer, setFirstPlayer] = useState<Mark>("lion");
  const [scores, setScores] = useState({ lion: 0, croco: 0, draws: 0 });

  const result = getResult(board);
  const isOver = result !== null;

  function handleClick(index: number) {
    if (board[index] || isOver) return;

    const nextBoard = [...board];
    nextBoard[index] = currentPlayer;
    setBoard(nextBoard);

    const nextResult = getResult(nextBoard);
    if (nextResult?.winner) {
      setScores((prev) => ({ ...prev, [nextResult.winner as Mark]: prev[nextResult.winner as Mark] + 1 }));
    } else if (nextResult && nextResult.winner === null) {
      setScores((prev) => ({ ...prev, draws: prev.draws + 1 }));
    } else {
      setCurrentPlayer(currentPlayer === "lion" ? "croco" : "lion");
    }
  }

  function newRound() {
    const next = firstPlayer === "lion" ? "croco" : "lion";
    setFirstPlayer(next);
    setCurrentPlayer(next);
    setBoard(Array(9).fill(null));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex items-center gap-6">
        <ScoreBadge mark="lion" score={scores.lion} isActive={!isOver && currentPlayer === "lion"} />
        <span className="text-muted text-sm">Nuls : {scores.draws}</span>
        <ScoreBadge mark="croco" score={scores.croco} isActive={!isOver && currentPlayer === "croco"} />
      </div>

      {!isOver && (
        <p className="text-sm text-muted">
          Au tour de {PLAYERS[currentPlayer].emoji} {PLAYERS[currentPlayer].label}
        </p>
      )}
      {isOver && result?.winner && (
        <p className="font-display text-xl text-primary">
          {PLAYERS[result.winner].emoji} {PLAYERS[result.winner].label} gagne !
        </p>
      )}
      {isOver && !result?.winner && <p className="font-display text-xl text-primary">Match nul !</p>}

      <div className="grid grid-cols-3 gap-2 w-full max-w-xs">
        {board.map((cell, index) => {
          const isWinningCell = result?.line?.includes(index) ?? false;
          return (
            <button
              key={index}
              type="button"
              onClick={() => handleClick(index)}
              disabled={Boolean(cell) || isOver}
              className={`aspect-square rounded-xl border-2 flex items-center justify-center text-4xl transition-colors ${
                isWinningCell ? "border-accent bg-accent/10" : "border-border bg-card"
              } ${!cell && !isOver ? "hover:bg-primary/5" : ""}`}
            >
              {cell && PLAYERS[cell].emoji}
            </button>
          );
        })}
      </div>

      {isOver && (
        <button type="button" onClick={newRound} className="rounded-full bg-primary text-primary-foreground text-sm px-5 py-2.5 hover:opacity-90 transition-opacity">
          Nouvelle manche
        </button>
      )}
    </div>
  );
}

function ScoreBadge({ mark, score, isActive }: { mark: Mark; score: number; isActive: boolean }) {
  return (
    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-colors ${isActive ? "border-primary" : "border-transparent"}`}>
      <span className="text-2xl">{PLAYERS[mark].emoji}</span>
      <span className="text-sm font-medium">{score}</span>
    </div>
  );
}
