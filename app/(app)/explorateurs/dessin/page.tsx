import Link from "next/link";
import { listTrips } from "@/lib/trips/data";
import { DrawingCanvas } from "./drawing-canvas";
import { ExplorersPageHeader } from "../page-header";

export default async function DrawingPage() {
  const trips = await listTrips();

  return (
    <div className="flex flex-col gap-6">
      <ExplorersPageHeader
        title="Je dessine"
        subtitle="Dessine ce que tu veux, ou un souvenir d'un voyage."
        action={
          <Link href="/explorateurs/dessin/galerie" className="on-bg text-sm underline">
            Voir mes dessins →
          </Link>
        }
      />

      <DrawingCanvas trips={trips.map((trip) => ({ id: trip.id, title: trip.title }))} />
    </div>
  );
}
