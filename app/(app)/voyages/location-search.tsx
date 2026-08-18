"use client";

import { useEffect, useRef, useState } from "react";
import type { GeocodeResult } from "@/app/api/geocode/route";

export function LocationSearch({
  onSelect,
  initialLabel,
}: {
  onSelect: (result: GeocodeResult) => void;
  initialLabel?: string;
}) {
  const [query, setQuery] = useState(initialLabel ?? "");
  const [results, setResults] = useState<GeocodeResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      if (query.trim().length < 2) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`);
        const data: { results: GeocodeResult[] } = await res.json();
        setResults(data.results);
        setIsOpen(true);
      } finally {
        setIsLoading(false);
      }
    }, 400);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query]);

  return (
    <div className="relative sm:col-span-2 flex flex-col gap-1">
      <label htmlFor="location-search" className="text-xs text-muted">
        Lieu (recherche)
      </label>
      <input
        id="location-search"
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => results.length > 0 && setIsOpen(true)}
        onBlur={() => setTimeout(() => setIsOpen(false), 150)}
        placeholder="Serengeti, Tanzanie…"
        autoComplete="off"
        className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
      />
      {isLoading && <p className="text-xs text-muted">Recherche…</p>}

      {isOpen && results.length > 0 && (
        <ul className="absolute z-10 top-full mt-1 w-full bg-card border border-border rounded-lg shadow-md max-h-64 overflow-y-auto">
          {results.map((result, index) => (
            <li key={index}>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setQuery(result.label);
                  setIsOpen(false);
                  onSelect(result);
                }}
                className="w-full text-left px-3 py-2 text-sm hover:bg-primary/10 transition-colors"
              >
                {result.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
