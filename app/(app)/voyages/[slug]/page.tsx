import { notFound } from "next/navigation";
import Image from "next/image";
import { getTripBySlug, listTripDays, listTripMedia } from "@/lib/trips/data";
import { requireFamilyProfile } from "@/lib/auth/session";
import { AddDayForm } from "./add-day-form";
import { PhotoUploader } from "./photo-uploader";

function formatDateRange(start: string, end: string | null) {
  const fmt = new Intl.DateTimeFormat("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  const startLabel = fmt.format(new Date(start));
  if (!end) return startLabel;
  return `${startLabel} — ${fmt.format(new Date(end))}`;
}

export default async function TripPage({ params }: PageProps<"/voyages/[slug]">) {
  const { slug } = await params;
  const [trip, profile] = await Promise.all([getTripBySlug(slug), requireFamilyProfile()]);
  if (!trip) notFound();

  const [days, media] = await Promise.all([listTripDays(trip.id), listTripMedia(trip.id)]);
  const isParent = profile.role === "parent";
  const mediaByDay = new Map<string | null, typeof media>();
  for (const item of media) {
    const key = item.trip_day_id;
    mediaByDay.set(key, [...(mediaByDay.get(key) ?? []), item]);
  }
  const unassignedMedia = mediaByDay.get(null) ?? [];

  return (
    <div className="flex flex-col gap-10">
      <div className="rounded-2xl overflow-hidden bg-primary text-primary-foreground relative">
        {trip.cover_image?.url && (
          <Image
            src={trip.cover_image.url}
            alt={trip.cover_image.alt ?? trip.title}
            fill
            className="object-cover opacity-40"
          />
        )}
        <div className="relative px-6 py-10 sm:px-10 sm:py-14">
          <p className="text-sm uppercase tracking-wide text-primary-foreground/70">
            {trip.city ? `${trip.city}, ${trip.country}` : trip.country}
          </p>
          <h1 className="font-display text-3xl sm:text-4xl mt-1">{trip.title}</h1>
          <p className="mt-2 text-primary-foreground/80">{formatDateRange(trip.start_date, trip.end_date)}</p>
          {trip.summary && <p className="mt-4 max-w-2xl text-primary-foreground/90">{trip.summary}</p>}
        </div>
      </div>

      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <h2 className="font-display text-2xl text-primary">Photos & vidéos</h2>
          {isParent && <PhotoUploader tripId={trip.id} tripSlug={trip.slug} />}
        </div>

        {media.length === 0 ? (
          <p className="text-muted text-sm">Aucun souvenir ajouté pour ce voyage pour le moment.</p>
        ) : (
          <MediaGrid items={unassignedMedia.length > 0 ? unassignedMedia : media} />
        )}
      </section>

      <section className="flex flex-col gap-4">
        <h2 className="font-display text-2xl text-primary">Journal de voyage</h2>

        {days.length === 0 ? (
          <p className="text-muted text-sm">Aucune journée racontée pour l&apos;instant.</p>
        ) : (
          <ol className="flex flex-col gap-4">
            {days.map((day) => {
              const dayMedia = mediaByDay.get(day.id) ?? [];
              return (
                <li key={day.id} className="bg-card border border-border rounded-xl p-4 sm:p-5">
                  <div className="flex items-baseline gap-3">
                    <span className="font-display text-accent text-lg shrink-0">Jour {day.day_number}</span>
                    <h3 className="font-medium">{day.title}</h3>
                  </div>
                  {day.description && <p className="text-sm text-foreground/80 mt-2">{day.description}</p>}
                  {dayMedia.length > 0 && (
                    <div className="mt-3">
                      <MediaGrid items={dayMedia} compact />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        )}

        {isParent && <AddDayForm tripId={trip.id} tripSlug={trip.slug} nextDayNumber={days.length + 1} />}
      </section>
    </div>
  );
}

function MediaGrid({ items, compact = false }: { items: { id: string; signedUrl: string | null; type: string; caption: string | null }[]; compact?: boolean }) {
  return (
    <div className={`grid gap-2 ${compact ? "grid-cols-3 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4"}`}>
      {items.map((item) =>
        item.signedUrl ? (
          <div key={item.id} className="relative aspect-square rounded-lg overflow-hidden bg-primary/10">
            {item.type === "video" ? (
              <video src={item.signedUrl} className="w-full h-full object-cover" controls />
            ) : (
              <Image src={item.signedUrl} alt={item.caption ?? ""} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" unoptimized />
            )}
          </div>
        ) : null
      )}
    </div>
  );
}
