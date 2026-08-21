import Link from "next/link";
import { listFindChallenges } from "@/lib/find-challenges/data";
import { requireFamilyProfile } from "@/lib/auth/session";
import { FindGame } from "./find-game";
import { ExplorersPageHeader } from "../../page-header";

export default async function FindChallengePage() {
  const [profile, challenges] = await Promise.all([requireFamilyProfile(), listFindChallenges()]);
  const isParent = profile.role === "parent";

  return (
    <div className="flex flex-col gap-6">
      <ExplorersPageHeader
        title="Cherche et trouve"
        subtitle="Retrouve l'animal caché dans nos photos de voyage."
        action={
          isParent && (
            <Link href="/explorateurs/jeux/cherche-trouve/nouveau" className="rounded-full bg-accent text-accent-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity">
              + Créer un défi
            </Link>
          )
        }
      />

      {challenges.length === 0 ? (
        <p className="on-bg text-sm">
          Aucun défi pour l&apos;instant. {isParent ? "Clique sur « Créer un défi » pour en ajouter un." : "Demande à un parent d'en créer un."}
        </p>
      ) : (
        <FindGame challenges={challenges} isParent={isParent} />
      )}
    </div>
  );
}
