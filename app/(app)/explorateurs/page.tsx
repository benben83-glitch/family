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
  { emoji: "🎨", title: "Je dessine", href: null, available: false },
  { emoji: "🧠", title: "Quiz", href: "/explorateurs/quiz", available: true },
  { emoji: "🎮", title: "Jeux", href: null, available: false },
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
        <span className="text-5xl">🧭</span>
        <h1 className="font-display text-3xl sm:text-4xl text-primary">Le Club des Explorateurs</h1>
        <p className="text-muted max-w-md">Cartes d&apos;animaux, quiz et jeux liés à nos voyages.</p>

        {children.length > 0 ? (
          <ChildPicker childProfiles={children} />
        ) : (
          profile.role === "parent" && <p className="text-muted text-sm">Ajoute un profil enfant pour personnaliser cet espace.</p>
        )}
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {ACTIVITIES.map((activity) =>
          activity.available && activity.href ? (
            <Link
              key={activity.title}
              href={activity.href}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="text-4xl">{activity.emoji}</span>
              <p className="font-display text-lg text-primary">{activity.title}</p>
            </Link>
          ) : (
            <div key={activity.title} className="bg-card/50 border border-dashed border-border rounded-2xl p-6 flex flex-col items-center text-center gap-2 opacity-60">
              <span className="text-4xl grayscale">{activity.emoji}</span>
              <p className="font-display text-lg text-muted">{activity.title}</p>
              <p className="text-xs text-muted">Bientôt</p>
            </div>
          )
        )}
      </section>

      <section className="bg-primary/5 border border-primary/15 rounded-2xl p-6 flex flex-wrap items-center justify-center gap-8 text-center">
        <Stat value={unlockedCount} label="cartes débloquées" />
        <Stat value={cards.length} label="cartes au total" />
        <Stat value={trips.length} label={`voyage${trips.length > 1 ? "s" : ""} raconté${trips.length > 1 ? "s" : ""}`} />
      </section>

      {profile.role === "parent" && (
        <section className="flex flex-col items-center gap-3 pt-4 border-t border-border">
          <p className="text-sm text-muted">Profils enfants</p>
          {children.length > 0 && (
            <div className="flex flex-wrap gap-3 justify-center">
              {children.map((child) => (
                <span key={child.id} className="text-sm bg-card border border-border rounded-full px-3 py-1">
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
