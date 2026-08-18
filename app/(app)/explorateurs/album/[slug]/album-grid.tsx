"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/media/compress-image";
import { fillSlot, clearSlot } from "../actions";
import type { SlotWithImage } from "@/lib/albums/data";

export function AlbumGrid({ albumSlug, slots, isParent }: { albumSlug: string; slots: SlotWithImage[]; isParent: boolean }) {
  const [confirmClearId, setConfirmClearId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function handleFill(slot: SlotWithImage, file: File) {
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      const compressed = await compressImage(file);
      const path = `${crypto.randomUUID()}-${compressed.name}`;
      const { error: uploadError } = await supabase.storage.from("sticker-albums").upload(path, compressed);
      if (uploadError) {
        setError(`Échec de l'envoi : ${uploadError.message}`);
        return;
      }
      const result = await fillSlot({ slotId: slot.id, albumSlug, storagePath: path });
      if (result.error) setError(result.error);
    });
  }

  function handleClear(slot: SlotWithImage) {
    startTransition(async () => {
      const result = await clearSlot({ slotId: slot.id, albumSlug, storagePath: slot.image?.storage_path ?? null });
      if (result.error) setError(result.error);
      setConfirmClearId(null);
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {slots.map((slot) => (
          <div key={slot.id} className="relative aspect-[3/4] rounded-xl overflow-hidden border-2 border-dashed border-border bg-card/50">
            {slot.signedImageUrl ? (
              <>
                <Image src={slot.signedImageUrl} alt={slot.label ?? `Sticker ${slot.slot_number}`} fill className="object-cover" unoptimized />
                {isParent &&
                  (confirmClearId === slot.id ? (
                    <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-2 p-2">
                      <p className="text-white text-xs text-center">Retirer ?</p>
                      <div className="flex gap-2">
                        <button type="button" disabled={isPending} onClick={() => handleClear(slot)} className="rounded-full bg-red-600 text-white text-xs px-3 py-1 disabled:opacity-50">
                          Oui
                        </button>
                        <button type="button" onClick={() => setConfirmClearId(null)} className="rounded-full bg-white/90 text-foreground text-xs px-3 py-1">
                          Non
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmClearId(slot.id)}
                      aria-label="Retirer ce sticker"
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/50 text-white text-xs flex items-center justify-center hover:bg-black/70 transition-colors"
                    >
                      ×
                    </button>
                  ))}
              </>
            ) : isParent ? (
              <button
                type="button"
                onClick={() => inputRefs.current[slot.id]?.click()}
                disabled={isPending}
                className="w-full h-full flex flex-col items-center justify-center gap-1 text-muted hover:bg-primary/5 transition-colors disabled:opacity-50"
              >
                <span className="text-2xl">+</span>
                <span className="text-xs">#{slot.slot_number}</span>
                <input
                  ref={(el) => {
                    inputRefs.current[slot.id] = el;
                  }}
                  type="file"
                  accept="image/png,image/jpeg"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFill(slot, file);
                    e.target.value = "";
                  }}
                />
              </button>
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted">
                <span className="text-xs">#{slot.slot_number}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
