import Link from "next/link";
import Image from "next/image";
import { listAnimalCardsWithCollectionStatus } from "@/lib/animals/data";
import { requireFamilyProfile } from "@/lib/auth/session";
import { rarityOption } from "@/lib/animals/types";
import { ExplorersPageHeader } from "../page-header";

export default async function CardsPage() {
  const [profile, cards] = await Promise.all([requireFamilyProfile(), listAnimalCardsWithCollectionStatus()]);

  return (
    <div className="flex flex-col gap-6">
      <ExplorersPageHeader
        title="Mes cartes"
        subtitle={`${cards.filter((c) => c.unlocked).length} / ${cards.length} cartes débloquées`}
        action={
          profile.role === "parent" && (
            <Link href="/explorateurs/cartes/nouvelle" className="rounded-full bg-accent text-accent-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity">
              + Créer une carte
            </Link>
          )
        }
      />

      {cards.length === 0 ? (
        <p className="on-bg text-sm">Aucune carte créée pour l&apos;instant.</p>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {cards.map((card) => {
            const rarity = rarityOption(card.rarity);

            if (!card.unlocked) {
              return (
                <div
                  key={card.id}
                  className="aspect-[3/4] rounded-2xl border-2 border-dashed border-white/70 bg-card/70 flex flex-col items-center justify-center gap-2 text-center px-3"
                >
                  <span className="text-3xl grayscale opacity-50">🔒</span>
                  <p className="text-sm text-muted">???</p>
                </div>
              );
            }

            return (
              <Link
                key={card.id}
                href={`/explorateurs/cartes/${card.id}`}
                className="group aspect-[3/4] rounded-2xl overflow-hidden border-2 relative bg-card hover:-translate-y-1 transition-transform"
                style={{ borderColor: rarity.color }}
              >
                {card.signedImageUrl ? (
                  <Image
                    src={card.signedImageUrl}
                    alt={card.name}
                    fill
                    sizes="(min-width: 768px) 25vw, 50vw"
                    className="object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🐾</div>
                )}
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-2 pt-6">
                  <p className="text-white text-sm font-medium truncate">{card.name}</p>
                  <p className="text-xs" style={{ color: rarity.color }}>
                    {rarity.label}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
