import Link from "next/link";
import Image from "next/image";
import { listAlbums } from "@/lib/albums/data";
import { requireFamilyProfile } from "@/lib/auth/session";
import { ExplorersPageHeader } from "../page-header";

export default async function AlbumsPage() {
  const [profile, albums] = await Promise.all([requireFamilyProfile(), listAlbums()]);

  return (
    <div className="flex flex-col gap-6">
      <ExplorersPageHeader
        title="Mon album"
        action={
          profile.role === "parent" && (
            <Link href="/explorateurs/album/nouveau" className="rounded-full bg-accent text-accent-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity">
              + Nouvel album
            </Link>
          )
        }
      />

      {albums.length === 0 ? (
        <p className="on-bg text-sm">Aucun album créé pour l&apos;instant.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {albums.map((album) => (
            <Link
              key={album.id}
              href={`/explorateurs/album/${album.slug}`}
              className="group rounded-2xl overflow-hidden bg-card border border-border hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/3] bg-primary/10">
                {album.signedBackgroundUrl ? (
                  <Image src={album.signedBackgroundUrl} alt={album.title} fill className="object-cover group-hover:scale-105 transition-transform duration-300" unoptimized />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">📖</div>
                )}
              </div>
              <div className="p-4">
                <h2 className="font-display text-lg text-primary">{album.title}</h2>
                <p className="text-sm text-muted mt-1">
                  {album.filledCount} / {album.slot_count} emplacements remplis
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
