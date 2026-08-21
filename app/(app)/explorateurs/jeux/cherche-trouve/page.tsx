import Link from "next/link";
import { listFindChallenges } from "@/lib/find-challenges/data";
import { requireFamilyProfile } from "@/lib/auth/session";
import { FindGame } from "./find-game";

export default async function FindChallengePage() {
  const [profile, challenges] = await Promise.all([requireFamilyProfile(), listFindChallenges()]);
  const isParent = profile.role === "parent";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-primary">Cherche et trouve</h1>
          <p className="text-muted text-sm mt-1">Retrouve l&apos;animal caché dans nos photos de voyage.</p>
        </div>
        {isParent && (
          <Link href="/explorateurs/jeux/cherche-trouve/nouveau" className="rounded-full bg-accent text-accent-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity">
            + Créer un défi
          </Link>
        )}
      </div>

      {challenges.length === 0 ? (
        <p className="text-muted text-sm">
          Aucun défi pour l&apos;instant. {isParent ? "Clique sur « Créer un défi » pour en ajouter un." : "Demande à un parent d'en créer un."}
        </p>
      ) : (
        <FindGame challenges={challenges} isParent={isParent} />
      )}
    </div>
  );
}
