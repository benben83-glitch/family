"use client";

import { useState } from "react";

type Phase = "setup" | "preview" | "playing" | "finished";
type LayoutCard = { key: string; animalId: string; emoji: string; name: string };

const ANIMALS = [
  { id: "lion", emoji: "🦁", name: "Lion" },
  { id: "elephant", emoji: "🐘", name: "Éléphant" },
  { id: "girafe", emoji: "🦒", name: "Girafe" },
  { id: "singe", emoji: "🐒", name: "Singe" },
  { id: "zebre", emoji: "🦓", name: "Zèbre" },
  { id: "tigre", emoji: "🐯", name: "Tigre" },
  { id: "panda", emoji: "🐼", name: "Panda" },
  { id: "renard", emoji: "🦊", name: "Renard" },
  { id: "koala", emoji: "🐨", name: "Koala" },
  { id: "grenouille", emoji: "🐸", name: "Grenouille" },
  { id: "poulpe", emoji: "🐙", name: "Poulpe" },
  { id: "papillon", emoji: "🦋", name: "Papillon" },
  { id: "tortue", emoji: "🐢", name: "Tortue" },
  { id: "hibou", emoji: "🦉", name: "Hibou" },
  { id: "dauphin", emoji: "🐬", name: "Dauphin" },
];

const PLAYERS = [
  { label: "Bleu", color: "#3d6fd9" },
  { label: "Jaune", color: "#c99a1f" },
  { label: "Rouge", color: "#d94f4f" },
  { label: "Vert", color: "#4f9e5a" },
];

const PREVIEW_MS = 2500;
const MATCH_PAUSE_MS = 600;
const MISMATCH_PAUSE_MS = 1100;

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MemoryGame() {
  const [phase, setPhase] = useState<Phase>("setup");
  const [playerCount, setPlayerCount] = useState(2);
  const [layout, setLayout] = useState<LayoutCard[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Record<string, number>>({});
  const [pendingPair, setPendingPair] = useState<string[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState(0);
  const [scores, setScores] = useState<number[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  function startGame(count: number) {
    const deck = shuffle(
      ANIMALS.flatMap((animal) => [
        { key: `${animal.id}-a`, animalId: animal.id, emoji: animal.emoji, name: animal.name },
        { key: `${animal.id}-b`, animalId: animal.id, emoji: animal.emoji, name: animal.name },
      ])
    );
    setLayout(deck);
    setPlayerCount(count);
    setScores(new Array(count).fill(0));
    setCurrentPlayer(0);
    setMatched({});
    setPendingPair([]);
    setRevealed(new Set(deck.map((c) => c.key)));
    setIsBusy(true);
    setPhase("preview");

    setTimeout(() => {
      setRevealed(new Set());
      setIsBusy(false);
      setPhase("playing");
    }, PREVIEW_MS);
  }

  function handleFlip(key: string) {
    if (isBusy || phase !== "playing") return;
    if (matched[key] !== undefined || revealed.has(key) || pendingPair.length === 2) return;

    setRevealed((prev) => new Set(prev).add(key));
    const nextPending = [...pendingPair, key];
    setPendingPair(nextPending);

    if (nextPending.length === 2) {
      setIsBusy(true);
      const [firstKey, secondKey] = nextPending;
      const first = layout.find((c) => c.key === firstKey);
      const second = layout.find((c) => c.key === secondKey);
      const winner = currentPlayer;

      if (first && second && first.animalId === second.animalId) {
        setTimeout(() => {
          setMatched((prev) => {
            const next = { ...prev, [firstKey]: winner, [secondKey]: winner };
            if (Object.keys(next).length === layout.length) setPhase("finished");
            return next;
          });
          setScores((prev) => prev.map((s, i) => (i === winner ? s + 1 : s)));
          setPendingPair([]);
          setIsBusy(false);
        }, MATCH_PAUSE_MS);
      } else {
        setTimeout(() => {
          setRevealed((prev) => {
            const next = new Set(prev);
            next.delete(firstKey);
            next.delete(secondKey);
            return next;
          });
          setPendingPair([]);
          setIsBusy(false);
          setCurrentPlayer((p) => (p + 1) % playerCount);
        }, MISMATCH_PAUSE_MS);
      }
    }
  }

  if (phase === "setup") {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-muted text-sm">Combien de joueurs ?</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {[1, 2, 3, 4].map((count) => (
            <button
              key={count}
              type="button"
              onClick={() => startGame(count)}
              className="bg-card border border-border rounded-2xl px-6 py-4 flex flex-col items-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="font-display text-2xl text-primary">{count}</span>
              <div className="flex gap-1">
                {PLAYERS.slice(0, count).map((p) => (
                  <span key={p.label} className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  if (phase === "finished") {
    const maxScore = Math.max(...scores);
    const winners = scores.flatMap((score, i) => (score === maxScore ? [i] : []));
    const isTie = winners.length > 1;

    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="text-5xl">🏆</span>
        <p className="font-display text-2xl text-primary">
          {playerCount === 1 ? "Bravo, terminé !" : isTie ? "Égalité !" : `${PLAYERS[winners[0]].label} gagne !`}
        </p>
        {playerCount > 1 && (
          <div className="flex gap-4">
            {scores.map((score, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <span className="w-4 h-4 rounded-full" style={{ backgroundColor: PLAYERS[i].color }} />
                <span className="text-sm">{score} paire{score > 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        )}
        <button type="button" onClick={() => setPhase("setup")} className="rounded-full bg-primary text-primary-foreground text-sm px-5 py-2.5 hover:opacity-90 transition-opacity">
          Rejouer
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {playerCount > 1 && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {PLAYERS.slice(0, playerCount).map((p, i) => (
            <div
              key={p.label}
              className="flex items-center gap-2 px-3 py-1.5 rounded-full border-2 transition-all"
              style={{ borderColor: i === currentPlayer && phase === "playing" ? p.color : "transparent", opacity: phase === "playing" && i !== currentPlayer ? 0.6 : 1 }}
            >
              <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
              <span className="text-sm">{scores[i]}</span>
            </div>
          ))}
        </div>
      )}

      {phase === "preview" && <p className="text-center text-sm text-muted">Mémorise bien… les cartes se retournent dans un instant !</p>}

      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-1.5 sm:gap-2 max-w-2xl mx-auto w-full">
        {layout.map((card) => {
          const winner = matched[card.key];
          const isFaceUp = winner !== undefined || revealed.has(card.key);
          const ringColor = winner !== undefined ? PLAYERS[winner].color : undefined;

          return (
            <button
              key={card.key}
              type="button"
              onClick={() => handleFlip(card.key)}
              disabled={isFaceUp || phase !== "playing"}
              className="aspect-square [perspective:800px]"
              aria-label={isFaceUp ? card.name : "Carte retournée"}
            >
              <div
                className="relative w-full h-full transition-transform duration-300 [transform-style:preserve-3d]"
                style={{ transform: isFaceUp ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                <div className="absolute inset-0 rounded-lg bg-primary flex items-center justify-center text-xs sm:text-sm [backface-visibility:hidden]">🧭</div>
                <div
                  className="absolute inset-0 rounded-lg flex items-center justify-center text-sm sm:text-base bg-card border-2 [backface-visibility:hidden]"
                  style={{ transform: "rotateY(180deg)", borderColor: ringColor ?? "var(--border)" }}
                >
                  {card.emoji}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
