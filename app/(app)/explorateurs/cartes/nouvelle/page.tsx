import { redirect } from "next/navigation";
import { requireFamilyProfile } from "@/lib/auth/session";
import { CreateCardForm } from "./create-card-form";
import { ExplorersPageHeader } from "../../page-header";

export default async function NewCardPage() {
  const profile = await requireFamilyProfile();
  if (profile.role !== "parent") redirect("/explorateurs/cartes");

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <ExplorersPageHeader title="Nouvelle carte animal" />
      <CreateCardForm />
    </div>
  );
}
