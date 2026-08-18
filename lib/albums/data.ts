import { createClient } from "@/lib/supabase/server";
import type { StickerAlbum, StickerSlot } from "./types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

async function resolveSignedUrls(paths: string[]): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.storage.from("sticker-albums").createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  const entries = (data ?? []).filter((entry) => entry.path && entry.signedUrl) as { path: string; signedUrl: string }[];
  return new Map(entries.map((entry) => [entry.path, entry.signedUrl]));
}

export type AlbumWithProgress = StickerAlbum & { filledCount: number; signedBackgroundUrl: string | null };

export async function listAlbums(): Promise<AlbumWithProgress[]> {
  const supabase = await createClient();
  const [{ data: albums }, { data: slots }] = await Promise.all([
    supabase.from("sticker_albums").select("*").order("sort_order", { ascending: true }),
    supabase.from("sticker_slots").select("album_id, image"),
  ]);

  const filledCountByAlbum = new Map<string, number>();
  for (const slot of slots ?? []) {
    if (slot.image) filledCountByAlbum.set(slot.album_id, (filledCountByAlbum.get(slot.album_id) ?? 0) + 1);
  }

  const allAlbums = (albums ?? []) as StickerAlbum[];
  const backgroundPaths = allAlbums.filter((a) => a.background_image?.storage_path).map((a) => a.background_image!.storage_path);
  const urlByPath = await resolveSignedUrls(backgroundPaths);

  return allAlbums.map((album) => ({
    ...album,
    filledCount: filledCountByAlbum.get(album.id) ?? 0,
    signedBackgroundUrl: album.background_image?.storage_path ? (urlByPath.get(album.background_image.storage_path) ?? null) : null,
  }));
}

export async function getAlbumBySlug(slug: string): Promise<AlbumWithProgress | null> {
  const supabase = await createClient();
  const { data: album } = await supabase.from("sticker_albums").select("*").eq("slug", slug).maybeSingle();
  if (!album) return null;

  const { data: slots } = await supabase.from("sticker_slots").select("image").eq("album_id", album.id);
  const filledCount = (slots ?? []).filter((slot) => slot.image).length;

  const path = (album as StickerAlbum).background_image?.storage_path;
  const urlByPath = path ? await resolveSignedUrls([path]) : new Map<string, string>();

  return {
    ...(album as StickerAlbum),
    filledCount,
    signedBackgroundUrl: path ? (urlByPath.get(path) ?? null) : null,
  };
}

export type SlotWithImage = StickerSlot & { signedImageUrl: string | null };

export async function listAlbumSlots(albumId: string): Promise<SlotWithImage[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("sticker_slots").select("*").eq("album_id", albumId).order("slot_number", { ascending: true });

  const slots = (data ?? []) as StickerSlot[];
  const paths = slots.filter((slot) => slot.image?.storage_path).map((slot) => slot.image!.storage_path);
  const urlByPath = await resolveSignedUrls(paths);

  return slots.map((slot) => ({
    ...slot,
    signedImageUrl: slot.image?.storage_path ? (urlByPath.get(slot.image.storage_path) ?? null) : null,
  }));
}
