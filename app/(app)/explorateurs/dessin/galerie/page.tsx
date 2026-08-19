import Link from "next/link";
import { listDrawings } from "@/lib/drawings/data";
import { DrawingGrid } from "./drawing-grid";

export default async function DrawingGalleryPage() {
  const drawings = await listDrawings();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-primary">Mes dessins de voyage</h1>
          <p className="text-muted text-sm mt-1">{drawings.length} dessin{drawings.length > 1 ? "s" : ""} sauvegardé{drawings.length > 1 ? "s" : ""}.</p>
        </div>
        <Link href="/explorateurs/dessin" className="rounded-full bg-accent text-accent-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity">
          + Nouveau dessin
        </Link>
      </div>

      {drawings.length === 0 ? (
        <p className="text-muted text-sm">Aucun dessin pour l&apos;instant.</p>
      ) : (
        <DrawingGrid drawings={drawings} />
      )}
    </div>
  );
}
