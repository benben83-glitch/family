"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { geoEquirectangular, geoPath } from "d3-geo";
import { select } from "d3-selection";
import { zoom, zoomIdentity, type D3ZoomEvent, type ZoomBehavior } from "d3-zoom";
import "d3-transition";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { Feature, Geometry } from "geojson";
import countriesTopology from "world-atlas/countries-110m.json";
import type { Trip } from "@/lib/trips/types";

const WIDTH = 960;
const HEIGHT = 500;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

// Palette d'atlas illustré : chaque pays garde une teinte stable (dérivée de
// son id numérique) parmi ce jeu de couleurs cohérent avec le reste du site.
const LAND_COLORS = ["#a9c9a0", "#c9b877", "#8fb8a8", "#c99b7a", "#9fb896", "#b8a97e", "#7fb0a0", "#c2a888"];

export function WorldMap({ trips }: { trips: Trip[] }) {
  const [selected, setSelected] = useState<Trip | null>(null);
  const [transform, setTransform] = useState(zoomIdentity);
  const svgRef = useRef<SVGSVGElement>(null);
  const zoomBehaviorRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  const { countries, projectPoint } = useMemo(() => {
    const topology = countriesTopology as unknown as Topology<{ countries: GeometryCollection }>;
    const collection = feature(topology, topology.objects.countries) as unknown as {
      features: Feature<Geometry, { name?: string }>[];
    };
    const projection = geoEquirectangular().fitSize([WIDTH, HEIGHT], collection as never);
    const path = geoPath(projection);

    return {
      countries: collection.features.map((f, index) => ({
        key: f.id != null ? String(f.id) : `country-${index}`,
        d: path(f) ?? "",
        color: LAND_COLORS[Number(f.id ?? index) % LAND_COLORS.length],
      })),
      projectPoint: (longitude: number, latitude: number) => projection([longitude, latitude]),
    };
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svgSelection = select(svgRef.current);
    const behavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .translateExtent([
        [0, 0],
        [WIDTH, HEIGHT],
      ])
      .on("zoom", (event: D3ZoomEvent<SVGSVGElement, unknown>) => setTransform(event.transform));

    svgSelection.call(behavior);
    zoomBehaviorRef.current = behavior;

    return () => {
      svgSelection.on(".zoom", null);
    };
  }, []);

  function zoomBy(factor: number) {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select(svgRef.current).transition().duration(200).call(zoomBehaviorRef.current.scaleBy, factor);
  }

  function resetZoom() {
    if (!svgRef.current || !zoomBehaviorRef.current) return;
    select(svgRef.current).transition().duration(200).call(zoomBehaviorRef.current.transform, zoomIdentity);
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-gradient-to-b from-[#bfe0ef] to-[#7fb8d8]">
        <svg ref={svgRef} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} className="w-full h-auto block cursor-grab active:cursor-grabbing touch-none">
          <g transform={transform.toString()}>
            {countries.map((country) => (
              <path key={country.key} d={country.d} fill={country.color} stroke="#f6f1e7" strokeWidth={0.5} />
            ))}

            {trips.map((trip) => {
              const point = projectPoint(trip.longitude, trip.latitude);
              if (!point) return null;
              const [x, y] = point;
              const isSelected = selected?.id === trip.id;
              const inverseScale = 1 / transform.k;

              return (
                <g
                  key={trip.id}
                  transform={`translate(${x}, ${y}) scale(${inverseScale})`}
                  onClick={() => setSelected(trip)}
                  className="cursor-pointer"
                  role="button"
                  aria-label={trip.title}
                >
                  <circle r={isSelected ? 9 : 7} className="fill-accent transition-all" stroke="#fff" strokeWidth={1.5} />
                </g>
              );
            })}
          </g>
        </svg>

        <div className="absolute bottom-3 right-3 flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => zoomBy(1.5)}
            aria-label="Zoomer"
            className="w-8 h-8 rounded-full bg-card border border-border text-primary text-lg leading-none flex items-center justify-center hover:bg-primary/10 transition-colors"
          >
            +
          </button>
          <button
            type="button"
            onClick={() => zoomBy(1 / 1.5)}
            aria-label="Dézoomer"
            className="w-8 h-8 rounded-full bg-card border border-border text-primary text-lg leading-none flex items-center justify-center hover:bg-primary/10 transition-colors"
          >
            −
          </button>
          <button
            type="button"
            onClick={resetZoom}
            aria-label="Réinitialiser la vue"
            className="w-8 h-8 rounded-full bg-card border border-border text-primary text-xs leading-none flex items-center justify-center hover:bg-primary/10 transition-colors"
          >
            ⟲
          </button>
        </div>
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
