import { signOut } from "./actions";

export function PendingScreen({ fullName }: { fullName: string | null }) {
  return (
    <div className="min-h-dvh flex items-center justify-center bg-background px-5">
      <div className="w-full max-w-sm text-center flex flex-col items-center gap-3">
        <span className="text-4xl">⏳</span>
        <p className="font-display text-2xl text-primary">En attente d&apos;approbation</p>
        <p className="text-muted text-sm">
          {fullName ? `Salut ${fullName}, ton` : "Ton"} compte a bien été créé, mais un parent doit encore l&apos;approuver avant que tu puisses
          accéder au carnet de la famille.
        </p>
        <form action={signOut} className="mt-2">
          <button type="submit" className="text-sm text-muted hover:text-foreground transition-colors underline">
            Déconnexion
          </button>
        </form>
      </div>
    </div>
  );
}
