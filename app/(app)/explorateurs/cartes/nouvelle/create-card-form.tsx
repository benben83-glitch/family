"use client";

import { useRef, useState, useTransition, type FormEvent } from "react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/media/compress-image";
import { createAnimalCard } from "../../actions";
import { DIET_OPTIONS, RARITY_OPTIONS, type Diet, type Rarity } from "@/lib/animals/types";

export function CreateCardForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const file = formData.get("image") as File | null;
      let storagePath: string | null = null;

      if (file && file.size > 0) {
        const supabase = createClient();
        const compressed = await compressImage(file);
        const path = `${crypto.randomUUID()}-${compressed.name}`;
        const { error: uploadError } = await supabase.storage.from("animal-cards").upload(path, compressed);
        if (uploadError) {
          setError(`Échec de l'envoi de l'image : ${uploadError.message}`);
          return;
        }
        storagePath = path;
      }

      const result = await createAnimalCard({
        name: String(formData.get("name") ?? ""),
        species: String(formData.get("species") ?? ""),
        habitat: String(formData.get("habitat") ?? ""),
        diet: formData.get("diet") as Diet,
        continent: String(formData.get("continent") ?? ""),
        sizeLabel: String(formData.get("size_label") ?? ""),
        weightLabel: String(formData.get("weight_label") ?? ""),
        speedLabel: String(formData.get("speed_label") ?? ""),
        dangerLabel: String(formData.get("danger_label") ?? ""),
        funFact: String(formData.get("fun_fact") ?? ""),
        rarity: formData.get("rarity") as Rarity,
        storagePath,
      });

      if (result?.error) setError(result.error);
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-4">
      <Field label="Nom" name="name" required placeholder="Lion" />
      <Field label="Espèce (optionnel)" name="species" placeholder="Panthera leo" />

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="diet" className="text-xs text-muted">
            Régime alimentaire
          </label>
          <select id="diet" name="diet" required className="bg-background border border-border rounded-lg px-3 py-2 text-sm">
            {DIET_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.icon} {option.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="rarity" className="text-xs text-muted">
            Rareté
          </label>
          <select id="rarity" name="rarity" required defaultValue="commune" className="bg-background border border-border rounded-lg px-3 py-2 text-sm">
            {RARITY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Habitat" name="habitat" placeholder="Savane" />
        <Field label="Continent" name="continent" placeholder="Afrique" />
        <Field label="Taille" name="size_label" placeholder="1,2 m au garrot" />
        <Field label="Poids" name="weight_label" placeholder="190 kg" />
        <Field label="Vitesse" name="speed_label" placeholder="80 km/h" />
        <Field label="Dangerosité" name="danger_label" placeholder="Élevée" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="fun_fact" className="text-xs text-muted">
          Anecdote (optionnel)
        </label>
        <textarea id="fun_fact" name="fun_fact" rows={2} className="bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="image" className="text-xs text-muted">
          Image (optionnel)
        </label>
        <input id="image" name="image" type="file" accept="image/*" className="text-sm" />
      </div>

      {error && <p className="text-sm text-red-700">{error}</p>}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-full bg-primary text-primary-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {isPending ? "Création…" : "Créer la carte"}
      </button>
    </form>
  );
}

function Field({ label, name, placeholder, required }: { label: string; name: string; placeholder?: string; required?: boolean }) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-muted">
        {label}
      </label>
      <input id={name} name={name} type="text" placeholder={placeholder} required={required} className="bg-background border border-border rounded-lg px-3 py-2 text-sm" />
    </div>
  );
}
