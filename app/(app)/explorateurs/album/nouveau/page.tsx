import { redirect } from "next/navigation";
import { requireFamilyProfile } from "@/lib/auth/session";
import { CreateAlbumForm } from "./create-album-form";
import { ExplorersPageHeader } from "../../page-header";

export default async function NewAlbumPage() {
  const profile = await requireFamilyProfile();
  if (profile.role !== "parent") redirect("/explorateurs/album");

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-6">
      <ExplorersPageHeader title="Nouvel album" />
      <CreateAlbumForm />
    </div>
  );
}
