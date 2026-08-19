import Link from "next/link";
import { listTrips } from "@/lib/trips/data";
import { DrawingCanvas } from "./drawing-canvas";

export default async function DrawingPage() {
  const trips = await listTrips();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-3xl text-primary">Je dessine</h1>
          <p className="text-muted text-sm mt-1">Dessine ce que tu veux, ou un souvenir d&apos;un voyage.</p>
        </div>
        <Link href="/explorateurs/dessin/galerie" className="text-sm text-accent hover:underline">
          Voir mes dessins →
        </Link>
      </div>

      <DrawingCanvas trips={trips.map((trip) => ({ id: trip.id, title: trip.title }))} />
    </div>
  );
}
