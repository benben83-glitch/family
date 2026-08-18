import { createClient } from "@/lib/supabase/server";
import type { AnimalCard } from "./types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type CollectionCard = AnimalCard & { unlocked: boolean; signedImageUrl: string | null };

async function resolveSignedUrls(paths: string[]): Promise<Map<string, string>> {
  if (paths.length === 0) return new Map();
  const supabase = await createClient();
  const { data } = await supabase.storage.from("animal-cards").createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  const entries = (data ?? []).filter((entry) => entry.path && entry.signedUrl) as { path: string; signedUrl: string }[];
  return new Map(entries.map((entry) => [entry.path, entry.signedUrl]));
}

/** Cartes triées, avec leur statut débloqué/verrouillé (famille entière, voir 002_kids_universe.sql). */
export async function listAnimalCardsWithCollectionStatus(): Promise<CollectionCard[]> {
  const supabase = await createClient();
  const [{ data: cards }, { data: links }] = await Promise.all([
    supabase.from("animal_cards").select("*").order("sort_order", { ascending: true }).order("name", { ascending: true }),
    supabase.from("trip_animal_cards").select("animal_card_id"),
  ]);

  const unlockedIds = new Set((links ?? []).map((link) => link.animal_card_id as string));
  const allCards = (cards ?? []) as AnimalCard[];
  const paths = allCards.filter((card) => unlockedIds.has(card.id) && card.image?.storage_path).map((card) => card.image!.storage_path);
  const urlByPath = await resolveSignedUrls(paths);

  return allCards.map((card) => ({
    ...card,
    unlocked: unlockedIds.has(card.id),
    signedImageUrl: card.image?.storage_path ? (urlByPath.get(card.image.storage_path) ?? null) : null,
  }));
}

export async function getAnimalCard(id: string): Promise<CollectionCard | null> {
  const supabase = await createClient();
  const [{ data: card }, { data: links }] = await Promise.all([
    supabase.from("animal_cards").select("*").eq("id", id).maybeSingle(),
    supabase.from("trip_animal_cards").select("trip_id, trips(title, slug)").eq("animal_card_id", id),
  ]);

  if (!card) return null;

  const unlocked = (links?.length ?? 0) > 0;
  const path = card.image?.storage_path;
  const urlByPath = unlocked && path ? await resolveSignedUrls([path]) : new Map<string, string>();

  return {
    ...(card as AnimalCard),
    unlocked,
    signedImageUrl: path ? (urlByPath.get(path) ?? null) : null,
  };
}

export async function getAnimalCardTrips(id: string): Promise<{ slug: string; title: string }[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("trip_animal_cards").select("trips(slug, title)").eq("animal_card_id", id);
  return (data ?? []).map((row) => row.trips as unknown as { slug: string; title: string });
}

export async function getTripAnimalCardIds(tripId: string): Promise<Set<string>> {
  const supabase = await createClient();
  const { data } = await supabase.from("trip_animal_cards").select("animal_card_id").eq("trip_id", tripId);
  return new Set((data ?? []).map((row) => row.animal_card_id as string));
}
