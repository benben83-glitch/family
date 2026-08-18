"use client";

import { useState, useTransition, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/media/compress-image";
import { createAlbum } from "../actions";

export function CreateAlbumForm() {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const file = formData.get("background") as File | null;
      let backgroundStoragePath: string | null = null;

      if (file && file.size > 0) {
        const supabase = createClient();
        const compressed = await compressImage(file);
        const path = `${crypto.randomUUID()}-${compressed.name}`;
        const { error: uploadError } = await supabase.storage.from("sticker-albums").upload(path, compressed);
        if (uploadError) {
          setError(`Échec de l'envoi du décor : ${uploadError.message}`);
          return;
        }
        backgroundStoragePath = path;
      }

      const result = await createAlbum({
        title: String(formData.get("title") ?? ""),
        description: String(formData.get("description") ?? ""),
        slotCount: Number(formData.get("slot_count")),
        backgroundStoragePath,
      });

      if (result?.error) setError(result.error);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="title" className="text-xs text-muted">
          Titre
        </label>
        <input id="title" name="title" type="text" required placeholder="Savane africaine" className="bg-background border border-border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-xs text-muted">
          Description (optionnel)
        </label>
        <textarea id="description" name="description" rows={2} className="bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="slot_count" className="text-xs text-muted">
          Nombre d&apos;emplacements
        </label>
        <input
          id="slot_count"
          name="slot_count"
          type="number"
          min={1}
          max={100}
          defaultValue={12}
          required
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm w-24"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="background" className="text-xs text-muted">
          Image de décor (optionnel — savane, forêt amazonienne…)
        </label>
        <input id="background" name="background" type="file" accept="image/png,image/jpeg" className="text-sm" />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full bg-primary text-primary-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? "Création…" : "Créer l'album"}
      </button>
    </form>
  );
}
