"use client";

import { useState, useTransition } from "react";
import { deleteAlbum } from "../actions";

export function DeleteAlbumButton({ albumId }: { albumId: string }) {
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete() {
    startTransition(async () => {
      const result = await deleteAlbum(albumId);
      if (result?.error) setError(result.error);
    });
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 text-sm bg-card border border-border rounded-full px-4 py-2 w-fit shadow-sm">
        <span>Supprimer cet album et son contenu ?</span>
        <button type="button" disabled={isPending} onClick={handleDelete} className="rounded-full bg-red-600 text-white text-xs px-3 py-1 disabled:opacity-50">
          Oui, supprimer
        </button>
        <button type="button" onClick={() => setConfirming(false)} className="rounded-full bg-background border border-border text-xs px-3 py-1">
          Annuler
        </button>
        {error && <span className="text-red-700">{error}</span>}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setConfirming(true)}
      className="text-sm text-muted hover:text-red-700 transition-colors bg-card/90 border border-border rounded-full px-4 py-2 shadow-sm"
    >
      Supprimer l&apos;album
    </button>
  );
}
