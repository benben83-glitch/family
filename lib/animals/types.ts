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
  { value: "commune", label: "Commune", color: "#7fa8d9" },
  { value: "rare", label: "Rare", color: "#2f6fed" },
  { value: "tres_rare", label: "Très rare", color: "#8b5cf6" },
  { value: "epique", label: "Épique", color: "#f2872e" },
  { value: "legendaire", label: "Légendaire", color: "#f5b83d" },
];

export function dietOption(diet: Diet) {
  return DIET_OPTIONS.find((option) => option.value === diet) ?? DIET_OPTIONS[DIET_OPTIONS.length - 1];
}

export function rarityOption(rarity: Rarity) {
  return RARITY_OPTIONS.find((option) => option.value === rarity) ?? RARITY_OPTIONS[0];
}
