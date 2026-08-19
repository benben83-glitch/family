"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function saveDrawing(params: {
  storagePath: string;
  title: string | null;
  tripId: string | null;
  childProfileId: string | null;
}): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("drawings").insert({
    storage_path: params.storagePath,
    title: params.title,
    trip_id: params.tripId,
    child_profile_id: params.childProfileId,
    created_by: user?.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/explorateurs/dessin/galerie");
  return { error: null };
}

export async function deleteDrawing(params: { drawingId: string; storagePath: string }): Promise<{ error: string | null }> {
  const supabase = await createClient();

  await supabase.storage.from("drawings").remove([params.storagePath]);

  const { error } = await supabase.from("drawings").delete().eq("id", params.drawingId);
  if (error) return { error: error.message };

  revalidatePath("/explorateurs/dessin/galerie");
  return { error: null };
}
