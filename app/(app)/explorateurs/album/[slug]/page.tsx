import Image from "next/image";
import { notFound } from "next/navigation";
import { getAlbumBySlug, listAlbumSlots } from "@/lib/albums/data";
import { requireFamilyProfile } from "@/lib/auth/session";
import { AlbumGrid } from "./album-grid";
import { DeleteAlbumButton } from "./delete-album-button";

export default async function AlbumPage({ params }: PageProps<"/explorateurs/album/[slug]">) {
  const { slug } = await params;
  const [album, profile] = await Promise.all([getAlbumBySlug(slug), requireFamilyProfile()]);
  if (!album) notFound();

  const slots = await listAlbumSlots(album.id);
  const isParent = profile.role === "parent";

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl overflow-hidden bg-primary text-primary-foreground relative">
        {album.signedBackgroundUrl && (
          <Image src={album.signedBackgroundUrl} alt={album.title} fill className="object-cover opacity-40" unoptimized />
        )}
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <h1 className="font-display text-3xl sm:text-4xl">{album.title}</h1>
          {album.description && <p className="mt-2 max-w-2xl text-primary-foreground/90">{album.description}</p>}
          <p className="mt-2 text-primary-foreground/80 text-sm">
            {album.filledCount} / {album.slot_count} emplacements remplis
          </p>
        </div>
      </div>

      <AlbumGrid albumSlug={album.slug} slots={slots} isParent={isParent} />

      {isParent && (
        <div className="pt-4 border-t border-border">
          <DeleteAlbumButton albumId={album.id} />
        </div>
      )}
    </div>
  );
}
