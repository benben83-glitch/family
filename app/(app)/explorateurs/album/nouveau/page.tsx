import { redirect } from "next/navigation";
import { requireFamilyProfile } from "@/lib/auth/session";
import { CreateAlbumForm } from "./create-album-form";

export default async function NewAlbumPage() {
  const profile = await requireFamilyProfile();
  if (profile.role !== "parent") redirect("/explorateurs/album");

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <h1 className="font-display text-3xl text-primary">Nouvel album</h1>
      <CreateAlbumForm />
    </div>
  );
}
