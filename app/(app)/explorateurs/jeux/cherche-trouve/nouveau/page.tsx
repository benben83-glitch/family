import { redirect } from "next/navigation";
import { requireFamilyProfile } from "@/lib/auth/session";
import { listAllTripPhotos } from "@/lib/trips/data";
import { CreateChallengeForm } from "./create-challenge-form";

export default async function NewChallengePage() {
  const profile = await requireFamilyProfile();
  if (profile.role !== "parent") redirect("/explorateurs/jeux/cherche-trouve");

  const photos = await listAllTripPhotos();

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <h1 className="font-display text-3xl text-primary">Nouveau défi « Cherche et trouve »</h1>

      {photos.length === 0 ? (
        <p className="text-muted text-sm">Ajoute d&apos;abord des photos à un voyage pour pouvoir créer un défi.</p>
      ) : (
        <CreateChallengeForm photos={photos} />
      )}
    </div>
  );
}
