import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAnimalCard, getAnimalCardTrips } from "@/lib/animals/data";
import { dietOption, rarityOption } from "@/lib/animals/types";

export default async function CardDetailPage({ params }: PageProps<"/explorateurs/cartes/[id]">) {
  const { id } = await params;
  const card = await getAnimalCard(id);
  if (!card) notFound();

  if (!card.unlocked) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <span className="text-5xl grayscale opacity-50">🔒</span>
        <p className="font-display text-2xl on-bg">Carte pas encore débloquée</p>
        <p className="on-bg text-sm max-w-xs">Cette carte apparaîtra ici dès qu&apos;elle sera associée à un voyage.</p>
        <Link href="/explorateurs/cartes" className="on-bg text-sm underline">
          ← Retour aux cartes
        </Link>
      </div>
    );
  }

  const diet = dietOption(card.diet);
  const rarity = rarityOption(card.rarity);
  const trips = await getAnimalCardTrips(card.id);

  return (
    <div className="flex flex-col gap-6 max-w-2xl mx-auto">
      <Link href="/explorateurs/cartes" className="on-bg text-sm self-start underline">
        ← Retour aux cartes
      </Link>

      <div className="grid sm:grid-cols-[220px_1fr] gap-6">
        <div className="relative aspect-[3/4] rounded-2xl overflow-hidden border-2 bg-card" style={{ borderColor: rarity.color }}>
          {card.signedImageUrl ? (
            <Image src={card.signedImageUrl} alt={card.name} fill className="object-cover" unoptimized />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">🐾</div>
          )}
        </div>

        <div className="flex flex-col gap-3 bg-card border border-border rounded-2xl p-5 shadow-sm">
          <div>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-white" style={{ backgroundColor: rarity.color }}>
              {rarity.label}
            </span>
            <h1 className="font-display text-3xl text-primary mt-2">{card.name}</h1>
            {card.species && <p className="text-muted text-sm italic">{card.species}</p>}
          </div>

          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Fact label="Régime" value={`${diet.icon} ${diet.label}`} />
            {card.habitat && <Fact label="Habitat" value={card.habitat} />}
            {card.continent && <Fact label="Continent" value={card.continent} />}
            {card.size_label && <Fact label="Taille" value={card.size_label} />}
            {card.weight_label && <Fact label="Poids" value={card.weight_label} />}
            {card.speed_label && <Fact label="Vitesse" value={card.speed_label} />}
            {card.danger_label && <Fact label="Dangerosité" value={card.danger_label} />}
          </dl>

          {card.fun_fact && (
            <p className="text-sm bg-primary/5 border border-primary/15 rounded-lg p-3">
              <span className="font-medium">Le sais-tu ?</span> {card.fun_fact}
            </p>
          )}

          {trips.length > 0 && (
            <div>
              <p className="text-xs text-muted mb-1">Découverte pendant :</p>
              <div className="flex flex-wrap gap-2">
                {trips.map((trip) => (
                  <Link key={trip.slug} href={`/voyages/${trip.slug}`} className="text-sm bg-background border border-border rounded-full px-3 py-1 hover:bg-primary/10 transition-colors">
                    {trip.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-medium">{value}</dd>
    </div>
  );
}
