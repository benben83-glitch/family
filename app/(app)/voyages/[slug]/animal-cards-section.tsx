"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useTransition } from "react";
import { linkAnimalCardToTrip, unlinkAnimalCardFromTrip } from "../../explorateurs/actions";
import { rarityOption } from "@/lib/animals/types";
import type { CollectionCard } from "@/lib/animals/data";

export function AnimalCardsSection({
  tripId,
  tripSlug,
  linkedCards,
  availableCards,
  isParent,
}: {
  tripId: string;
  tripSlug: string;
  linkedCards: CollectionCard[];
  availableCards: CollectionCard[];
  isParent: boolean;
}) {
  const [selectedCardId, setSelectedCardId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!isParent && linkedCards.length === 0) return null;

  function handleAdd() {
    if (!selectedCardId) return;
    startTransition(async () => {
      const result = await linkAnimalCardToTrip({ tripId, tripSlug, animalCardId: selectedCardId });
      if (result.error) setError(result.error);
      else setSelectedCardId("");
    });
  }

  function handleRemove(animalCardId: string) {
    startTransition(async () => {
      const result = await unlinkAnimalCardFromTrip({ tripId, tripSlug, animalCardId });
      if (result.error) setError(result.error);
    });
  }

  return (
    <section className="flex flex-col gap-3">
      <h2 className="font-display text-2xl text-primary">Animaux découverts</h2>

      {linkedCards.length === 0 ? (
        <p className="text-muted text-sm">Aucun animal associé à ce voyage pour l&apos;instant.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {linkedCards.map((card) => {
            const rarity = rarityOption(card.rarity);
            return (
              <div key={card.id} className="relative">
                <Link
                  href={`/explorateurs/cartes/${card.id}`}
                  className="flex items-center gap-2 bg-card border-2 rounded-full pl-1.5 pr-3 py-1.5 hover:shadow-sm transition-shadow"
                  style={{ borderColor: rarity.color }}
                >
                  <span className="relative w-7 h-7 rounded-full overflow-hidden bg-primary/10 shrink-0">
                    {card.signedImageUrl ? (
                      <Image src={card.signedImageUrl} alt={card.name} fill className="object-cover" unoptimized />
                    ) : (
                      <span className="w-full h-full flex items-center justify-center text-xs">🐾</span>
                    )}
                  </span>
                  <span className="text-sm">{card.name}</span>
                </Link>
                {isParent && (
                  <button
                    type="button"
                    onClick={() => handleRemove(card.id)}
                    disabled={isPending}
                    aria-label={`Retirer ${card.name}`}
                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-card border border-border text-xs flex items-center justify-center hover:bg-red-50 hover:text-red-700 transition-colors"
                  >
                    ×
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {isParent && availableCards.length > 0 && (
        <div className="flex items-center gap-2">
          <select
            value={selectedCardId}
            onChange={(e) => setSelectedCardId(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
          >
            <option value="">Ajouter un animal…</option>
            {availableCards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!selectedCardId || isPending}
            className="rounded-full border border-primary text-primary text-sm px-3 py-2 hover:bg-primary/10 transition-colors disabled:opacity-50"
          >
            Ajouter
          </button>
        </div>
      )}

      {error && <p className="text-sm text-red-700">{error}</p>}
    </section>
  );
}
