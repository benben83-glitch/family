"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FormActionState } from "@/lib/forms/action-state";

export async function addTripDay(prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  const tripId = String(formData.get("trip_id") ?? "");
  const tripSlug = String(formData.get("trip_slug") ?? "");
  const dayNumber = Number(formData.get("day_number"));
  const title = String(formData.get("title") ?? "").trim();
  const date = String(formData.get("date") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();

  if (!tripId || !title || Number.isNaN(dayNumber) || dayNumber < 1) {
    return { status: "error", message: "Numéro de jour et titre sont requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("trip_days").insert({
    trip_id: tripId,
    day_number: dayNumber,
    title,
    date: date || null,
    description: description || null,
  });

  if (error) {
    return { status: "error", message: "Impossible d'ajouter ce jour : " + error.message };
  }

  revalidatePath(`/voyages/${tripSlug}`);
  return { status: "success" };
}

/**
 * L'upload du fichier vers le bucket privé se fait côté client (composant
 * client, session utilisateur déjà authentifiée) — cette action n'insère que
 * la ligne `media` une fois le fichier en place, avec le même contrôle RLS
 * (parent uniquement) que l'upload storage lui-même.
 */
export async function addMedia(params: {
  tripId: string;
  tripSlug: string;
  tripDayId: string | null;
  type: "photo" | "video";
  storagePath: string;
  caption: string | null;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("media").insert({
    trip_id: params.tripId,
    trip_day_id: params.tripDayId,
    type: params.type,
    storage_path: params.storagePath,
    caption: params.caption,
  });

  if (error) return { error: error.message };

  revalidatePath(`/voyages/${params.tripSlug}`);
  return { error: null };
}

export async function deleteMedia(params: { mediaId: string; tripSlug: string; storagePath: string }): Promise<{ error: string | null }> {
  const supabase = await createClient();

  const { error: storageError } = await supabase.storage.from("trip-media").remove([params.storagePath]);
  if (storageError) return { error: storageError.message };

  const { error: dbError } = await supabase.from("media").delete().eq("id", params.mediaId);
  if (dbError) return { error: dbError.message };

  revalidatePath(`/voyages/${params.tripSlug}`);
  return { error: null };
}
