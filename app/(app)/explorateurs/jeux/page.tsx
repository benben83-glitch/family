import Link from "next/link";
import { ExplorersPageHeader } from "../page-header";

const GAMES = [
  { emoji: "🧩", title: "Memory", description: "Retrouve les paires d'animaux.", href: "/explorateurs/jeux/memory", available: true },
  { emoji: "🦁", title: "Morpion", description: "Lion contre Crocodile.", href: "/explorateurs/jeux/morpion", available: true },
  { emoji: "🔢", title: "Calcul mental", description: "Des petits calculs, 5-8 ans.", href: "/explorateurs/jeux/calcul", available: true },
  { emoji: "🔍", title: "Cherche et trouve", description: "Retrouve un animal dans une photo de voyage.", href: "/explorateurs/jeux/cherche-trouve", available: true },
];

export default function GamesPage() {
  return (
    <div className="flex flex-col gap-6">
      <ExplorersPageHeader title="Jeux" subtitle="Des petits jeux avec les animaux découverts pendant nos voyages." />

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {GAMES.map((game) =>
          game.available && game.href ? (
            <Link
              key={game.title}
              href={game.href}
              className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all"
            >
              <span className="text-4xl">{game.emoji}</span>
              <p className="font-display text-lg text-primary">{game.title}</p>
              <p className="text-xs text-muted">{game.description}</p>
            </Link>
          ) : (
            <div key={game.title} className="bg-card/85 border border-dashed border-white/70 rounded-2xl p-6 flex flex-col items-center text-center gap-2 opacity-80">
              <span className="text-4xl grayscale">{game.emoji}</span>
              <p className="font-display text-lg text-muted">{game.title}</p>
              <p className="text-xs text-muted">Bientôt</p>
            </div>
          )
        )}
      </div>
    </div>
  );
}
