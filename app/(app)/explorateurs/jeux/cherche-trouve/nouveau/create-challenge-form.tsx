"use client";

import { useRef, useState, useTransition } from "react";
import { createFindChallenge } from "../actions";
import type { TripPhoto } from "@/lib/trips/data";

export function CreateChallengeForm({ photos }: { photos: TripPhoto[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<TripPhoto | null>(null);
  const [target, setTarget] = useState<{ x: number; y: number } | null>(null);
  const [label, setLabel] = useState("");
  const imgRef = useRef<HTMLImageElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handlePickPoint(e: React.MouseEvent<HTMLImageElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    setTarget({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  }

  function handleSave() {
    if (!selectedPhoto || !target || !label.trim()) return;
    setError(null);
    startTransition(async () => {
      const result = await createFindChallenge({ mediaId: selectedPhoto.id, targetLabel: label, targetX: target.x, targetY: target.y });
      if (result?.error) setError(result.error);
    });
  }

  if (!selectedPhoto) {
    const byTrip = new Map<string, TripPhoto[]>();
    for (const photo of photos) {
      byTrip.set(photo.tripTitle, [...(byTrip.get(photo.tripTitle) ?? []), photo]);
    }

    return (
      <div className="flex flex-col gap-6">
        <p className="text-muted text-sm">Choisis une photo de voyage :</p>
        {[...byTrip.entries()].map(([tripTitle, tripPhotos]) => (
          <div key={tripTitle} className="flex flex-col gap-2">
            <p className="text-sm font-medium">{tripTitle}</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {tripPhotos.map((photo) => (
                <button
                  key={photo.id}
                  type="button"
                  onClick={() => setSelectedPhoto(photo)}
                  className="relative aspect-square rounded-lg overflow-hidden border border-border hover:ring-2 hover:ring-primary transition-all"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo.signedUrl} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <button type="button" onClick={() => { setSelectedPhoto(null); setTarget(null); }} className="text-sm text-accent hover:underline self-start">
        ← Choisir une autre photo
      </button>

      <p className="text-sm text-muted">Clique sur la photo à l&apos;endroit où se trouve l&apos;animal à trouver :</p>

      <div className="relative rounded-2xl overflow-hidden border border-border">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img ref={imgRef} src={selectedPhoto.signedUrl} alt="" onClick={handlePickPoint} className="w-full h-auto cursor-crosshair select-none" />
        {target && (
          <div
            className="absolute w-8 h-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-accent shadow-lg pointer-events-none"
            style={{ left: `${target.x * 100}%`, top: `${target.y * 100}%` }}
          />
        )}
      </div>

      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="label" className="text-xs text-muted">
            Que doit trouver l&apos;enfant ?
          </label>
          <input
            id="label"
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="la girafe"
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={!target || !label.trim() || isPending}
          className="rounded-full bg-primary text-primary-foreground text-sm px-5 py-2.5 hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {isPending ? "Enregistrement…" : "Créer le défi"}
        </button>
      </div>

      {!target && <p className="text-xs text-muted">Clique sur la photo pour placer la cible.</p>}
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
