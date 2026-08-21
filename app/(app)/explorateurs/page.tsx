import Link from "next/link";
import { listAnimalCardsWithCollectionStatus } from "@/lib/animals/data";
import { listChildProfiles } from "@/lib/children/data";
import { listTrips } from "@/lib/trips/data";
import { requireFamilyProfile } from "@/lib/auth/session";
import { ChildPicker } from "./child-picker";
import { AddChildForm } from "./add-child-form";

const ACTIVITIES = [
  { emoji: "🃏", title: "Mes cartes", href: "/explorateurs/cartes", available: true },
  { emoji: "📖", title: "Mon album", href: "/explorateurs/album", available: true },
  { emoji: "🎨", title: "Je dessine", href: "/explorateurs/dessin", available: true },
  { emoji: "❓", title: "Quiz", href: "/explorateurs/quiz", available: true },
  { emoji: "🎮", title: "Jeux", href: "/explorateurs/jeux", available: true },
  { emoji: "🏆", title: "Mes trophées", href: null, available: false },
];

export default async function ExplorersPage() {
  const [profile, children, cards, trips] = await Promise.all([
    requireFamilyProfile(),
    listChildProfiles(),
    listAnimalCardsWithCollectionStatus(),
    listTrips(),
  ]);

  const unlockedCount = cards.filter((card) => card.unlocked).length;

  return (
    <div className="flex flex-col gap-10">
      <section className="text-center flex flex-col items-center gap-4 py-6">
        <span className="text-5xl drop-shadow-lg">🧭</span>
        <h1 className="font-display text-3xl sm:text-4xl text-white [text-shadow:0_2px_10px_rgba(0,0,0,0.35)]">Le Club des Explorateurs</h1>
        <p className="text-white/95 max-w-md font-medium [text-shadow:0_1px_6px_rgba(0,0,0,0.3)]">Cartes d&apos;animaux, quiz et jeux liés à nos voyages.</p>

        {children.length > 0 ? (
          <ChildPicker childProfiles={children} />
        ) : (
          profile.role === "parent" && <p className="text-white/90 text-sm [text-shadow:0_1px_6px_rgba(0,0,0,0.3)]">Ajoute un profil enfant pour personnaliser cet espace.</p>
        )}
      </section>

      <section className="flex flex-wrap justify-center gap-3">
        {ACTIVITIES.map((activity) =>
          activity.available && activity.href ? (
            <Link
              key={activity.title}
              href={activity.href}
              className="flex items-center gap-2 rounded-full bg-gradient-to-b from-[#ffab4a] to-[#ff7a3d] text-white font-display text-sm sm:text-base px-5 py-2.5 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <span className="text-lg">{activity.emoji}</span>
              {activity.title}
            </Link>
          ) : (
            <div key={activity.title} className="flex items-center gap-2 rounded-full bg-white/70 text-muted font-display text-sm sm:text-base px-5 py-2.5 border border-dashed border-border opacity-80">
              <span className="text-lg grayscale">{activity.emoji}</span>
              {activity.title} <span className="text-xs">(bientôt)</span>
            </div>
          )
        )}
      </section>

      <section className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-wrap items-center justify-center gap-8 text-center shadow-sm">
        <Stat value={unlockedCount} label="cartes débloquées" />
        <Stat value={cards.length} label="cartes au total" />
        <Stat value={trips.length} label={`voyage${trips.length > 1 ? "s" : ""} raconté${trips.length > 1 ? "s" : ""}`} />
      </section>

      {profile.role === "parent" && (
        <section className="bg-card/90 backdrop-blur-sm border border-border rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm">
          <p className="text-sm text-muted">Profils enfants</p>
          {children.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {children.map((child) => (
                <span key={child.id} className="text-sm bg-background border border-border rounded-full px-3 py-1">
                  {child.avatar_emoji} {child.full_name}
                </span>
              ))}
            </div>
          )}
          <AddChildForm />
        </section>
      )}
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div>
      <p className="font-display text-3xl text-primary">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
