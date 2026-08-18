import Link from "next/link";
import Image from "next/image";
import { listRecentMedia, listTrips } from "@/lib/trips/data";
import { requireFamilyProfile } from "@/lib/auth/session";

const ENTRIES = [
  { href: "/voyages", emoji: "🧳", title: "Nos voyages", description: "Revivre chaque aventure, jour après jour." },
  { href: "/carte", emoji: "🗺️", title: "Notre carte du monde", description: "Tous les endroits explorés en famille." },
  { href: "/voyages", emoji: "📸", title: "Nos photos", description: "Les plus beaux souvenirs de chaque voyage." },
];

export default async function HomePage() {
  const [profile, trips, recentMedia] = await Promise.all([requireFamilyProfile(), listTrips(), listRecentMedia(8)]);
  const firstName = profile.full_name?.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-12">
      <section className="text-center flex flex-col items-center gap-3 py-8">
        <span className="text-4xl">🧭</span>
        <h1 className="font-display text-3xl sm:text-4xl text-primary">Bienvenue dans notre aventure familiale{firstName ? `, ${firstName}` : ""}</h1>
        <p className="text-muted max-w-xl">
          {trips.length > 0
            ? `${trips.length} voyage${trips.length > 1 ? "s" : ""} déjà racontés — le carnet de la famille continue de s'écrire.`
            : "Le carnet de voyage de la famille commence ici."}
        </p>
      </section>

      <section className="grid sm:grid-cols-3 gap-4">
        {ENTRIES.map((entry) => (
          <Link
            key={entry.title}
            href={entry.href}
            className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all"
          >
            <span className="text-3xl">{entry.emoji}</span>
            <p className="font-display text-lg text-primary">{entry.title}</p>
            <p className="text-sm text-muted">{entry.description}</p>
          </Link>
        ))}
      </section>

      <Link
        href="/explorateurs"
        className="bg-primary/5 border border-primary/15 rounded-2xl p-6 flex items-center gap-4 hover:bg-primary/10 transition-colors"
      >
        <span className="text-3xl">🌟</span>
        <div>
          <p className="font-display text-lg text-primary">Le Club des Explorateurs</p>
          <p className="text-sm text-muted mt-0.5">Cartes d&apos;animaux liées à nos voyages — quiz, dessin et badges à venir.</p>
        </div>
      </Link>

      {recentMedia.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="font-display text-2xl text-primary">Derniers souvenirs ajoutés</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {recentMedia.map((item) =>
              item.signedUrl ? (
                <Link key={item.id} href={`/voyages/${item.tripSlug}`} className="relative aspect-square rounded-xl overflow-hidden bg-primary/10 group">
                  {item.type === "video" ? (
                    <video src={item.signedUrl} className="w-full h-full object-cover" muted />
                  ) : (
                    <Image
                      src={item.signedUrl}
                      alt={item.caption ?? item.tripTitle}
                      fill
                      sizes="(min-width: 640px) 25vw, 50vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  )}
                </Link>
              ) : null
            )}
          </div>
        </section>
      )}
    </div>
  );
}
