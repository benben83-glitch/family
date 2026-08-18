"use client";

import Image from "next/image";
import { useEffect, useState, useTransition } from "react";
import { deleteMedia } from "./actions";

type MediaGridItem = {
  id: string;
  type: string;
  signedUrl: string | null;
  caption: string | null;
  storage_path: string;
};

export function MediaGrid({
  items,
  isParent,
  tripSlug,
  compact = false,
}: {
  items: MediaGridItem[];
  isParent: boolean;
  tripSlug: string;
  compact?: boolean;
}) {
  const visibleItems = items.filter((item): item is MediaGridItem & { signedUrl: string } => Boolean(item.signedUrl));
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(item: MediaGridItem) {
    startTransition(async () => {
      await deleteMedia({ mediaId: item.id, tripSlug, storagePath: item.storage_path });
      setConfirmId(null);
    });
  }

  return (
    <>
      <div className={`grid gap-2 ${compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}>
        {visibleItems.map((item, index) => (
          <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-primary/10">
            {item.type === "video" ? (
              <video src={item.signedUrl} className="w-full h-full object-cover" controls />
            ) : (
              <button type="button" onClick={() => setLightboxIndex(index)} className="w-full h-full block cursor-zoom-in" aria-label="Agrandir la photo">
                <Image src={item.signedUrl} alt={item.caption ?? ""} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" unoptimized />
              </button>
            )}

            {isParent &&
              (confirmId === item.id ? (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-white text-xs text-center">Supprimer ?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleDelete(item)}
                      className="rounded-full bg-red-600 text-white text-xs px-3 py-1 disabled:opacity-50"
                    >
                      Oui
                    </button>
                    <button type="button" onClick={() => setConfirmId(null)} className="rounded-full bg-white/90 text-foreground text-xs px-3 py-1">
                      Non
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setConfirmId(item.id)}
                  aria-label="Supprimer cette photo"
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  🗑
                </button>
              ))}
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={visibleItems}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}

function Lightbox({
  items,
  index,
  onClose,
  onNavigate,
}: {
  items: (MediaGridItem & { signedUrl: string })[];
  index: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const item = items[index];

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNavigate((index + 1) % items.length);
      if (e.key === "ArrowLeft") onNavigate((index - 1 + items.length) % items.length);
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [index, items.length, onClose, onNavigate]);

  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onClick={onClose}>
      <button type="button" onClick={onClose} aria-label="Fermer" className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20 transition-colors">
        ×
      </button>

      {items.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index - 1 + items.length) % items.length);
            }}
            aria-label="Photo précédente"
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onNavigate((index + 1) % items.length);
            }}
            aria-label="Photo suivante"
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 text-white text-xl flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            ›
          </button>
        </>
      )}

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={item.signedUrl}
        alt={item.caption ?? ""}
        onClick={(e) => e.stopPropagation()}
        className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
      />
    </div>
  );
}
