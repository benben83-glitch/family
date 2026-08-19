"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { Lightbox } from "@/components/lightbox";
import { deleteDrawing } from "../actions";
import type { DrawingWithDetails } from "@/lib/drawings/data";

export function DrawingGrid({ drawings }: { drawings: DrawingWithDetails[] }) {
  const visible = drawings.filter((d): d is DrawingWithDetails & { signedUrl: string } => Boolean(d.signedUrl));
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleDelete(drawing: DrawingWithDetails) {
    startTransition(async () => {
      await deleteDrawing({ drawingId: drawing.id, storagePath: drawing.storage_path });
      setConfirmId(null);
    });
  }

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {visible.map((drawing, index) => (
          <div key={drawing.id} className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="relative aspect-[4/3] bg-white">
              <button type="button" onClick={() => setLightboxIndex(index)} className="w-full h-full block cursor-zoom-in" aria-label="Agrandir le dessin">
                <Image src={drawing.signedUrl} alt={drawing.title ?? "Dessin"} fill className="object-contain" unoptimized />
              </button>

              {confirmId === drawing.id ? (
                <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-2">
                  <p className="text-white text-xs text-center">Supprimer ?</p>
                  <div className="flex gap-2">
                    <button type="button" disabled={isPending} onClick={() => handleDelete(drawing)} className="rounded-full bg-red-600 text-white text-xs px-3 py-1 disabled:opacity-50">
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
                  onClick={() => setConfirmId(drawing.id)}
                  aria-label="Supprimer ce dessin"
                  className="absolute top-1.5 right-1.5 w-7 h-7 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  🗑
                </button>
              )}
            </div>
            <div className="p-2.5">
              <p className="text-sm font-medium truncate">{drawing.title ?? "Sans titre"}</p>
              <p className="text-xs text-muted truncate">
                {drawing.childName ? `${drawing.childName} · ` : ""}
                {drawing.tripTitle ?? new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "short" }).format(new Date(drawing.created_at))}
              </p>
            </div>
          </div>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          items={visible.map((d) => ({ id: d.id, signedUrl: d.signedUrl, caption: d.title }))}
          index={lightboxIndex}
          onClose={() => setLightboxIndex(null)}
          onNavigate={setLightboxIndex}
        />
      )}
    </>
  );
}
