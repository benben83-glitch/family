"use client";

import { useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/media/compress-image";
import { safeStorageFilename } from "@/lib/media/safe-filename";
import { addMedia } from "./actions";

export function PhotoUploader({ tripId, tripSlug }: { tripId: string; tripSlug: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(files: FileList) {
    setError(null);
    const supabase = createClient();

    for (const file of Array.from(files)) {
      const type = file.type.startsWith("video/") ? "video" : "photo";
      const uploadFile = type === "photo" ? await compressImage(file) : file;
      const path = `${tripId}/${safeStorageFilename(uploadFile.name)}`;

      const { error: uploadError } = await supabase.storage.from("trip-media").upload(path, uploadFile);
      if (uploadError) {
        setError(`Échec de l'envoi de ${file.name} : ${uploadError.message}`);
        continue;
      }

      const { error: insertError } = await addMedia({ tripId, tripSlug, tripDayId: null, type, storagePath: path, caption: null });
      if (insertError) setError(insertError);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={(e) => {
          if (!e.target.files?.length) return;
          startTransition(() => handleFiles(e.target.files!));
          e.target.value = "";
        }}
      />
      <button
        type="button"
        disabled={isPending}
        onClick={() => inputRef.current?.click()}
        className="rounded-full border border-primary text-primary text-sm px-4 py-2 hover:bg-primary/10 transition-colors disabled:opacity-50"
      >
        {isPending ? "Envoi en cours…" : "+ Ajouter des photos/vidéos"}
      </button>
      {error && <p className="text-sm text-red-700">{error}</p>}
    </div>
  );
}
