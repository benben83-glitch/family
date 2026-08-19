"use client";

import { useState } from "react";

type MemoryAnimal = { id: string; name: string; signedImageUrl: string };
type LayoutCard = { key: string; animalId: string; name: string; imageUrl: string };

const LEVELS = [
  { label: "Facile", pairs: 3, totalCards: 6 },
  { label: "Moyen", pairs: 6, totalCards: 12 },
  { label: "Difficile", pairs: 10, totalCards: 20 },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function MemoryGame({ animals }: { animals: MemoryAnimal[] }) {
  const [layout, setLayout] = useState<LayoutCard[]>([]);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [pendingPair, setPendingPair] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isBusy, setIsBusy] = useState(false);
  const [level, setLevel] = useState<number | null>(null);

  function startLevel(pairs: number) {
    const chosen = shuffle(animals).slice(0, pairs);
    const newLayout = shuffle(
      chosen.flatMap((animal) => [
        { key: `${animal.id}-a`, animalId: animal.id, name: animal.name, imageUrl: animal.signedImageUrl },
        { key: `${animal.id}-b`, animalId: animal.id, name: animal.name, imageUrl: animal.signedImageUrl },
      ])
    );
    setLayout(newLayout);
    setRevealed(new Set());
    setMatched(new Set());
    setPendingPair([]);
    setMoves(0);
    setIsBusy(false);
    setLevel(pairs);
  }

  function handleFlip(key: string) {
    if (isBusy || matched.has(key) || revealed.has(key) || pendingPair.length === 2) return;

    const nextRevealed = new Set(revealed);
    nextRevealed.add(key);
    setRevealed(nextRevealed);

    const nextPending = [...pendingPair, key];
    setPendingPair(nextPending);

    if (nextPending.length === 2) {
      setMoves((m) => m + 1);
      const [firstKey, secondKey] = nextPending;
      const first = layout.find((c) => c.key === firstKey);
      const second = layout.find((c) => c.key === secondKey);

      if (first && second && first.animalId === second.animalId) {
        setMatched((prev) => new Set(prev).add(firstKey).add(secondKey));
        setPendingPair([]);
      } else {
        setIsBusy(true);
        setTimeout(() => {
          setRevealed((prev) => {
            const next = new Set(prev);
            next.delete(firstKey);
            next.delete(secondKey);
            return next;
          });
          setPendingPair([]);
          setIsBusy(false);
        }, 900);
      }
    }
  }

  if (level === null) {
    return (
      <div className="flex flex-col items-center gap-4 py-8">
        <p className="text-muted text-sm">Choisis un niveau :</p>
        <div className="flex flex-wrap gap-3 justify-center">
          {LEVELS.map((lvl) => {
            const disabled = animals.length < lvl.pairs;
            return (
              <button
                key={lvl.label}
                type="button"
                disabled={disabled}
                onClick={() => startLevel(lvl.pairs)}
                className="bg-card border border-border rounded-2xl px-6 py-4 flex flex-col items-center gap-1 hover:shadow-md hover:-translate-y-0.5 transition-all disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none"
              >
                <span className="font-display text-lg text-primary">{lvl.label}</span>
                <span className="text-xs text-muted">{lvl.totalCards} cartes</span>
                {disabled && <span className="text-xs text-red-700">Pas assez d&apos;animaux débloqués</span>}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  const isWon = layout.length > 0 && matched.size === layout.length;
  const columns = layout.length <= 6 ? "grid-cols-3" : layout.length <= 12 ? "grid-cols-4" : "grid-cols-5";

  if (isWon) {
    return (
      <div className="flex flex-col items-center gap-4 py-12 text-center">
        <span className="text-5xl">🏆</span>
        <p className="font-display text-2xl text-primary">Bravo ! Terminé en {moves} coups</p>
        <div className="flex gap-3">
          <button type="button" onClick={() => startLevel(level)} className="rounded-full bg-primary text-primary-foreground text-sm px-5 py-2.5 hover:opacity-90 transition-opacity">
            Rejouer
          </button>
          <button type="button" onClick={() => setLevel(null)} className="rounded-full border border-border text-sm px-5 py-2.5 hover:bg-primary/5 transition-colors">
            Changer de niveau
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between text-sm text-muted">
        <span>Coups : {moves}</span>
        <button type="button" onClick={() => setLevel(null)} className="text-accent hover:underline">
          Changer de niveau
        </button>
      </div>

      <div className={`grid ${columns} gap-2.5 sm:gap-3`}>
        {layout.map((card) => {
          const isFaceUp = matched.has(card.key) || revealed.has(card.key);
          return (
            <button
              key={card.key}
              type="button"
              onClick={() => handleFlip(card.key)}
              disabled={isFaceUp}
              className="aspect-[3/4] [perspective:800px]"
              aria-label={isFaceUp ? card.name : "Carte retournée"}
            >
              <div
                className="relative w-full h-full transition-transform duration-300 [transform-style:preserve-3d]"
                style={{ transform: isFaceUp ? "rotateY(180deg)" : "rotateY(0deg)" }}
              >
                <div className="absolute inset-0 rounded-xl bg-primary flex items-center justify-center text-2xl [backface-visibility:hidden]">🧭</div>
                <div
                  className="absolute inset-0 rounded-xl overflow-hidden border-2 border-border bg-card [backface-visibility:hidden]"
                  style={{ transform: "rotateY(180deg)" }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={card.imageUrl} alt={card.name} className="w-full h-full object-cover" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
