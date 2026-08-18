import { redirect } from "next/navigation";
import { requireFamilyProfile } from "@/lib/auth/session";
import { CreateCardForm } from "./create-card-form";

export default async function NewCardPage() {
  const profile = await requireFamilyProfile();
  if (profile.role !== "parent") redirect("/explorateurs/cartes");

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <h1 className="font-display text-3xl text-primary">Nouvelle carte animal</h1>
      <CreateCardForm />
    </div>
  );
}
