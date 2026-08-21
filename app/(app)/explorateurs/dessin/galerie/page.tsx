import Link from "next/link";
import { listDrawings } from "@/lib/drawings/data";
import { DrawingGrid } from "./drawing-grid";
import { ExplorersPageHeader } from "../../page-header";

export default async function DrawingGalleryPage() {
  const drawings = await listDrawings();

  return (
    <div className="flex flex-col gap-6">
      <ExplorersPageHeader
        title="Mes dessins de voyage"
        subtitle={`${drawings.length} dessin${drawings.length > 1 ? "s" : ""} sauvegardé${drawings.length > 1 ? "s" : ""}.`}
        action={
          <Link href="/explorateurs/dessin" className="rounded-full bg-accent text-accent-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity">
            + Nouveau dessin
          </Link>
        }
      />

      {drawings.length === 0 ? (
        <p className="on-bg text-sm">Aucun dessin pour l&apos;instant.</p>
      ) : (
        <DrawingGrid drawings={drawings} />
      )}
    </div>
  );
}
