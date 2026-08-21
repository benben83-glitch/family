"use client";

import { useRef, useState } from "react";
import { deleteFindChallenge } from "./actions";
import type { FindChallengeWithPhoto } from "@/lib/find-challenges/data";

const TOLERANCE_PX = 45;

function pickRandom<T>(items: T[], exclude?: string, getId?: (item: T) => string): T {
  const pool = exclude && getId ? items.filter((item) => getId(item) !== exclude) : items;
  const list = pool.length > 0 ? pool : items;
  return list[Math.floor(Math.random() * list.length)];
}

export function FindGame({ challenges, isParent }: { challenges: FindChallengeWithPhoto[]; isParent: boolean }) {
  const [current, setCurrent] = useState<FindChallengeWithPhoto>(() => pickRandom(challenges));
  const [markers, setMarkers] = useState<{ x: number; y: number; success: boolean }[]>([]);
  const [found, setFound] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  function nextChallenge() {
    setCurrent((prev) => pickRandom(challenges, prev.id, (c) => c.id));
    setMarkers([]);
    setFound(false);
    setConfirmDelete(false);
  }

  function handleClick(e: React.MouseEvent<HTMLImageElement>) {
    if (found) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    const dx = (x - current.target_x) * rect.width;
    const dy = (y - current.target_y) * rect.height;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const success = distance <= TOLERANCE_PX;

    setMarkers((prev) => [...prev, { x, y, success }]);
    if (success) setFound(true);
  }

  function handleDelete() {
    deleteFindChallenge(current.id);
    nextChallenge();
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="font-display text-xl on-bg text-center">
        {found ? "Bravo, tu as trouvé ! 🎉" : `Peux-tu retrouver ${current.target_label} ?`}
      </p>

      <div className="relative rounded-2xl overflow-hidden border-2 border-white shadow-lg">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={current.signedUrl} alt="" onClick={handleClick} className={`w-full h-auto select-none ${found ? "" : "cursor-crosshair"}`} />

        {markers.map((marker, i) => (
          <div
            key={i}
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 pointer-events-none"
            style={{ left: `${marker.x * 100}%`, top: `${marker.y * 100}%`, borderColor: marker.success ? "#4f9e5a" : "#d94f4f" }}
          />
        ))}

        {found && (
          <div
            className="absolute w-14 h-14 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-accent animate-pulse pointer-events-none"
            style={{ left: `${current.target_x * 100}%`, top: `${current.target_y * 100}%` }}
          />
        )}
      </div>

      {!found && markers.length > 0 && <p className="text-center text-sm on-bg">Pas tout à fait ! Essaie encore.</p>}

      <div className="flex justify-center gap-3">
        {found && (
          <button type="button" onClick={nextChallenge} className="rounded-full bg-primary text-primary-foreground text-sm px-5 py-2.5 hover:opacity-90 transition-opacity">
            Défi suivant
          </button>
        )}
      </div>

      {isParent && (
        <div className="self-center">
          {confirmDelete ? (
            <div className="flex items-center gap-2 text-sm bg-card border border-border rounded-full px-4 py-2 shadow-sm">
              <span>Supprimer ce défi ?</span>
              <button type="button" onClick={handleDelete} className="rounded-full bg-red-600 text-white text-xs px-3 py-1">
                Oui
              </button>
              <button type="button" onClick={() => setConfirmDelete(false)} className="rounded-full bg-background border border-border text-xs px-3 py-1">
                Non
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="text-xs text-muted hover:text-red-700 transition-colors bg-card/90 border border-border rounded-full px-3 py-1.5 shadow-sm"
            >
              Supprimer ce défi
            </button>
          )}
        </div>
      )}
    </div>
  );
}
