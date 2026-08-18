import { listTrips } from "@/lib/trips/data";
import { WorldMap } from "./world-map";

export default async function MapPage() {
  const trips = await listTrips();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-3xl text-primary">Notre carte du monde</h1>
        <p className="text-muted text-sm mt-1">{trips.length} voyage{trips.length > 1 ? "s" : ""} sur la carte.</p>
      </div>

      {trips.filter((t) => t.latitude && t.longitude).length === 0 ? (
        <p className="text-muted text-sm">Aucun voyage n&apos;a encore de coordonnées à afficher sur la carte.</p>
      ) : (
        <WorldMap trips={trips} />
      )}
    </div>
  );
}
