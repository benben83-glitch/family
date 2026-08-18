import { createClient } from "@/lib/supabase/server";
import { listAnimalCardsWithCollectionStatus } from "@/lib/animals/data";
import type { QuizData } from "./types";

/** Uniquement les voyages et animaux déjà découverts : pas de spoil sur des cartes verrouillées. */
export async function getQuizData(): Promise<QuizData> {
  const supabase = await createClient();
  const [{ data: trips }, { data: links }, cards] = await Promise.all([
    supabase.from("trips").select("id, title, country"),
    supabase.from("trip_animal_cards").select("trip_id, animal_card_id"),
    listAnimalCardsWithCollectionStatus(),
  ]);

  const tripAnimalIds: Record<string, string[]> = {};
  for (const link of links ?? []) {
    const key = link.trip_id as string;
    tripAnimalIds[key] = [...(tripAnimalIds[key] ?? []), link.animal_card_id as string];
  }

  return {
    trips: (trips ?? []).map((trip) => ({ id: trip.id as string, title: trip.title as string, country: trip.country as string })),
    animals: cards
      .filter((card) => card.unlocked)
      .map((card) => ({ id: card.id, name: card.name, diet: card.diet, habitat: card.habitat, continent: card.continent })),
    tripAnimalIds,
  };
}
