"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { FormActionState } from "@/lib/forms/action-state";
import type { Diet, Rarity } from "@/lib/animals/types";

export async function createChildProfile(prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const avatarEmoji = String(formData.get("avatar_emoji") ?? "🧒").trim() || "🧒";
  const birthDate = String(formData.get("birth_date") ?? "").trim();

  if (!fullName) return { status: "error", message: "Le prénom est requis." };

  const supabase = await createClient();
  const { error } = await supabase.from("child_profiles").insert({
    full_name: fullName,
    avatar_emoji: avatarEmoji,
    birth_date: birthDate || null,
  });

  if (error) return { status: "error", message: "Impossible d'ajouter ce profil : " + error.message };

  revalidatePath("/explorateurs");
  return { status: "success" };
}

export async function createAnimalCard(params: {
  name: string;
  species: string;
  habitat: string;
  diet: Diet;
  continent: string;
  sizeLabel: string;
  weightLabel: string;
  speedLabel: string;
  dangerLabel: string;
  funFact: string;
  rarity: Rarity;
  storagePath: string | null;
}): Promise<{ error: string | null }> {
  if (!params.name.trim()) return { error: "Le nom est requis." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("animal_cards").insert({
    name: params.name.trim(),
    species: params.species.trim() || null,
    habitat: params.habitat.trim() || null,
    diet: params.diet,
    continent: params.continent.trim() || null,
    size_label: params.sizeLabel.trim() || null,
    weight_label: params.weightLabel.trim() || null,
    speed_label: params.speedLabel.trim() || null,
    danger_label: params.dangerLabel.trim() || null,
    fun_fact: params.funFact.trim() || null,
    rarity: params.rarity,
    image: params.storagePath ? { storage_path: params.storagePath } : null,
    created_by: user?.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/explorateurs/cartes");
  redirect("/explorateurs/cartes");
}

export async function linkAnimalCardToTrip(params: { tripId: string; tripSlug: string; animalCardId: string }): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("trip_animal_cards").insert({ trip_id: params.tripId, animal_card_id: params.animalCardId });
  if (error) return { error: error.message };

  revalidatePath(`/voyages/${params.tripSlug}`);
  revalidatePath("/explorateurs/cartes");
  return { error: null };
}

export async function unlinkAnimalCardFromTrip(params: { tripId: string; tripSlug: string; animalCardId: string }): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("trip_animal_cards")
    .delete()
    .eq("trip_id", params.tripId)
    .eq("animal_card_id", params.animalCardId);
  if (error) return { error: error.message };

  revalidatePath(`/voyages/${params.tripSlug}`);
  revalidatePath("/explorateurs/cartes");
  return { error: null };
}
