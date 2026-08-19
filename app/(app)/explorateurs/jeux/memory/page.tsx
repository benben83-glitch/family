import { listAnimalCardsWithCollectionStatus } from "@/lib/animals/data";
import { MemoryGame } from "./memory-game";

export default async function MemoryPage() {
  const cards = await listAnimalCardsWithCollectionStatus();
  const animals = cards
    .filter((card): card is typeof card & { signedImageUrl: string } => card.unlocked && Boolean(card.signedImageUrl))
    .map((card) => ({ id: card.id, name: card.name, signedImageUrl: card.signedImageUrl }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-primary">Memory</h1>
        <p className="text-muted text-sm mt-1">Retrouve les paires d&apos;animaux découverts pendant nos voyages.</p>
      </div>

      {animals.length < 3 ? (
        <p className="text-muted text-sm">Débloque au moins 3 cartes animaux (avec une image) pour jouer — voir Mes cartes.</p>
      ) : (
        <MemoryGame animals={animals} />
      )}
    </div>
  );
}
