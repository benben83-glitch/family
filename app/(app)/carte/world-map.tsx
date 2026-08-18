"use client";

import Link from "next/link";
import Image from "next/image";
import { useMemo, useState } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import landTopology from "world-atlas/land-110m.json";
import type { Trip } from "@/lib/trips/types";

const WIDTH = 960;
const HEIGHT = 500;

export function WorldMap({ trips }: { trips: Trip[] }) {
  const [selected, setSelected] = useState<Trip | null>(null);

  const { landPath, projectPoint } = useMemo(() => {
    const topology = landTopology as unknown as Topology<{ land: GeometryCollection }>;
    const land = feature(topology, topology.objects.land);
    const projection = geoEquirectangular().fitSize([WIDTH, HEIGHT], land);
    const path = geoPath(projection);

    return {
      landPath: path(land) ?? "",
      projectPoint: (longitude: number, latitude: number) => projection([longitude, latitude]),
    };
  }, []);

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-gradient-to-b from-[#dceee9] to-[#c3ddd6]">
        <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto block">
          <path d={landPath} fill="#c9dfd4" stroke="#1f3d3a" strokeOpacity={0.25} strokeWidth={0.6} />

          {trips.map((trip) => {
            const point = projectPoint(trip.longitude, trip.latitude);
            if (!point) return null;
            const [x, y] = point;
            const isSelected = selected?.id === trip.id;

            return (
              <g
                key={trip.id}
                transform={`translate(${x}, ${y})`}
                onClick={() => setSelected(trip)}
                className="cursor-pointer"
                role="button"
                aria-label={trip.title}
              >
                <circle r={isSelected ? 9 : 7} className="fill-accent transition-all" stroke="#fff" strokeWidth={1.5} />
              </g>
            );
          })}
        </svg>
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
