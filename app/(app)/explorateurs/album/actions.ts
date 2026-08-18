"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format/slugify";

export async function createAlbum(params: {
  title: string;
  description: string;
  slotCount: number;
  backgroundStoragePath: string | null;
}): Promise<{ error: string | null }> {
  const title = params.title.trim();
  if (!title) return { error: "Le titre est requis." };
  if (!Number.isFinite(params.slotCount) || params.slotCount < 1 || params.slotCount > 100) {
    return { error: "Le nombre d'emplacements doit être entre 1 et 100." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const baseSlug = slugify(title);
  let slug = baseSlug;
  for (let attempt = 1; attempt < 10; attempt++) {
    const { data: existing } = await supabase.from("sticker_albums").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  const { data: album, error } = await supabase
    .from("sticker_albums")
    .insert({
      slug,
      title,
      description: params.description.trim() || null,
      background_image: params.backgroundStoragePath ? { storage_path: params.backgroundStoragePath } : null,
      slot_count: params.slotCount,
      created_by: user?.id,
    })
    .select("id")
    .single();

  if (error || !album) return { error: error?.message ?? "Impossible de créer l'album." };

  const slotRows = Array.from({ length: params.slotCount }, (_, i) => ({ album_id: album.id, slot_number: i + 1 }));
  const { error: slotsError } = await supabase.from("sticker_slots").insert(slotRows);
  if (slotsError) return { error: slotsError.message };

  revalidatePath("/explorateurs/album");
  redirect(`/explorateurs/album/${slug}`);
}

export async function fillSlot(params: { slotId: string; albumSlug: string; storagePath: string }): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("sticker_slots")
    .update({ image: { storage_path: params.storagePath }, filled_at: new Date().toISOString() })
    .eq("id", params.slotId);

  if (error) return { error: error.message };

  revalidatePath(`/explorateurs/album/${params.albumSlug}`);
  revalidatePath("/explorateurs/album");
  return { error: null };
}

export async function clearSlot(params: { slotId: string; albumSlug: string; storagePath: string | null }): Promise<{ error: string | null }> {
  const supabase = await createClient();

  if (params.storagePath) {
    await supabase.storage.from("sticker-albums").remove([params.storagePath]);
  }

  const { error } = await supabase.from("sticker_slots").update({ image: null, filled_at: null }).eq("id", params.slotId);
  if (error) return { error: error.message };

  revalidatePath(`/explorateurs/album/${params.albumSlug}`);
  revalidatePath("/explorateurs/album");
  return { error: null };
}
