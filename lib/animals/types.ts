export type Diet = "carnivore" | "herbivore" | "omnivore" | "piscivore" | "insectivore" | "autre";
export type Rarity = "commune" | "rare" | "tres_rare" | "epique" | "legendaire";

/** storage_path pointe vers le bucket privé "animal-cards" (voir lib/animals/data.ts pour la résolution en URL signée). */
export type CardImage = { storage_path: string; alt?: string };

export type AnimalCard = {
  id: string;
  name: string;
  species: string | null;
  habitat: string | null;
  diet: Diet;
  continent: string | null;
  size_label: string | null;
  weight_label: string | null;
  speed_label: string | null;
  danger_label: string | null;
  fun_fact: string | null;
  image: CardImage | null;
  rarity: Rarity;
};

export const DIET_OPTIONS: { value: Diet; label: string; icon: string }[] = [
  { value: "carnivore", label: "Carnivore", icon: "🥩" },
  { value: "herbivore", label: "Herbivore", icon: "🌿" },
  { value: "omnivore", label: "Omnivore", icon: "🍎" },
  { value: "piscivore", label: "Piscivore", icon: "🐟" },
  { value: "insectivore", label: "Insectivore", icon: "🦗" },
  { value: "autre", label: "Autre", icon: "🍽️" },
];

export const RARITY_OPTIONS: { value: Rarity; label: string; color: string }[] = [
  { value: "commune", label: "Commune", color: "#8f9c85" },
  { value: "rare", label: "Rare", color: "#4f80a3" },
  { value: "tres_rare", label: "Très rare", color: "#7a5ba3" },
  { value: "epique", label: "Épique", color: "#c1653b" },
  { value: "legendaire", label: "Légendaire", color: "#b8912f" },
];

export function dietOption(diet: Diet) {
  return DIET_OPTIONS.find((option) => option.value === diet) ?? DIET_OPTIONS[DIET_OPTIONS.length - 1];
}

export function rarityOption(rarity: Rarity) {
  return RARITY_OPTIONS.find((option) => option.value === rarity) ?? RARITY_OPTIONS[0];
}
