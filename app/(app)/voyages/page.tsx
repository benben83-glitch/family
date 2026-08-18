import Link from "next/link";
import Image from "next/image";
import { listTrips } from "@/lib/trips/data";
import { requireFamilyProfile } from "@/lib/auth/session";
import { CreateTripForm } from "./create-trip-form";

export default async function TripsPage() {
  const [trips, profile] = await Promise.all([listTrips(), requireFamilyProfile()]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h1 className="font-display text-3xl text-primary">Nos voyages</h1>
        {profile.role === "parent" && <CreateTripForm />}
      </div>

      {trips.length === 0 ? (
        <p className="text-muted text-sm">Aucun voyage enregistré pour l&apos;instant.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {trips.map((trip) => (
            <Link
              key={trip.id}
              href={`/voyages/${trip.slug}`}
              className="group rounded-2xl overflow-hidden bg-card border border-border hover:shadow-md transition-shadow"
            >
              <div className="relative aspect-[4/3] bg-primary/10">
                {trip.cover_image?.url ? (
                  <Image
                    src={trip.cover_image.url}
                    alt={trip.cover_image.alt ?? trip.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">🗺️</div>
                )}
              </div>
              <div className="p-4">
                <p className="text-xs uppercase tracking-wide text-muted">{trip.city ? `${trip.city}, ${trip.country}` : trip.country}</p>
                <h2 className="font-display text-lg text-primary mt-0.5">{trip.title}</h2>
                <p className="text-sm text-muted mt-1">{new Intl.DateTimeFormat("fr-FR", { month: "long", year: "numeric" }).format(new Date(trip.start_date))}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
