"use client";

import { useEffect, useState } from "react";
import type { ChildProfile } from "@/lib/children/types";

const STORAGE_KEY = "family:selected-child";

export function ChildPicker({ childProfiles }: { childProfiles: ChildProfile[] }) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSelectedId(localStorage.getItem(STORAGE_KEY));
      setHydrated(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (childProfiles.length === 0 || !hydrated) return null;

  const selected = childProfiles.find((child) => child.id === selectedId) ?? null;

  function select(child: ChildProfile) {
    localStorage.setItem(STORAGE_KEY, child.id);
    setSelectedId(child.id);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      {selected ? (
        <p className="on-bg text-sm font-medium">
          Salut {selected.full_name} {selected.avatar_emoji} —{" "}
          <button type="button" onClick={() => setSelectedId(null)} className="underline hover:opacity-80 transition-opacity">
            ce n&apos;est pas toi ?
          </button>
        </p>
      ) : (
        <>
          <p className="on-bg text-sm font-medium">Qui explore aujourd&apos;hui ?</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {childProfiles.map((child) => (
              <button
                key={child.id}
                type="button"
                onClick={() => select(child)}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl bg-card/90 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <span className="text-3xl">{child.avatar_emoji}</span>
                <span className="text-sm font-medium">{child.full_name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
