"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { projectToPercent } from "@/lib/geo/project";
import type { Trip } from "@/lib/trips/types";

const LATITUDES = [-60, -30, 0, 30, 60];
const LONGITUDES = [-150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150];

export function WorldMap({ trips }: { trips: Trip[] }) {
  const [selected, setSelected] = useState<Trip | null>(null);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full aspect-[2/1] rounded-2xl overflow-hidden border border-border bg-gradient-to-b from-[#dceee9] to-[#c3ddd6]">
        <svg viewBox="0 0 100 50" className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
          {LONGITUDES.map((lon) => {
            const { x } = projectToPercent(0, lon);
            return <line key={lon} x1={x} y1={0} x2={x} y2={50} stroke="#1f3d3a" strokeOpacity={0.08} strokeWidth={0.15} />;
          })}
          {LATITUDES.map((lat) => {
            const { y } = projectToPercent(lat, 0);
            return <line key={lat} x1={0} y1={y / 2} x2={100} y2={y / 2} stroke="#1f3d3a" strokeOpacity={0.08} strokeWidth={0.15} />;
          })}
        </svg>

        {trips.map((trip) => {
          const { x, y } = projectToPercent(trip.latitude, trip.longitude);
          const isSelected = selected?.id === trip.id;
          return (
            <button
              key={trip.id}
              type="button"
              onClick={() => setSelected(trip)}
              style={{ left: `${x}%`, top: `${y}%` }}
              className="absolute -translate-x-1/2 -translate-y-full flex flex-col items-center group"
              aria-label={trip.title}
            >
              <span
                className={`text-2xl drop-shadow-sm transition-transform group-hover:scale-125 ${isSelected ? "scale-125" : ""}`}
                aria-hidden
              >
                📍
              </span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="bg-card border border-border rounded-xl p-4 flex gap-4 items-center">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-primary/10 shrink-0">
            {selected.cover_image?.url ? (
              <Image src={selected.cover_image.url} alt={selected.title} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-2xl">🗺️</div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs uppercase tracking-wide text-muted">{selected.city ? `${selected.city}, ${selected.country}` : selected.country}</p>
            <p className="font-display text-lg text-primary">{selected.title}</p>
            {selected.summary && <p className="text-sm text-foreground/80 mt-1 line-clamp-2">{selected.summary}</p>}
          </div>
          <Link href={`/voyages/${selected.slug}`} className="shrink-0 rounded-full bg-primary text-primary-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity">
            Voir le voyage
          </Link>
        </div>
      ) : (
        <p className="text-muted text-sm text-center">Sélectionnez un repère 📍 pour découvrir le voyage associé.</p>
      )}
    </div>
  );
}
