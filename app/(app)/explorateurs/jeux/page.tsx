import Link from "next/link";

const GAMES = [
  { emoji: "🧩", title: "Memory", description: "Retrouve les paires d'animaux.", href: "/explorateurs/jeux/memory", available: true },
  { emoji: "🔍", title: "Cherche et trouve", description: "Retrouve un animal dans une photo de voyage.", href: null, available: false },
];

export default function GamesPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-primary">Jeux</h1>
        <p className="text-muted text-sm mt-1">Des petits jeux avec les animaux découverts pendant nos voyages.</p>
      </div>

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
            <div key={game.title} className="bg-card/50 border border-dashed border-border rounded-2xl p-6 flex flex-col items-center text-center gap-2 opacity-60">
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
