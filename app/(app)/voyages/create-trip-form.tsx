"use client";

import { useActionState, useState, type FormEvent } from "react";
import { createTrip } from "./actions";
import { initialFormState } from "@/lib/forms/action-state";
import { LocationSearch } from "./location-search";
import type { GeocodeResult } from "@/app/api/geocode/route";

export function CreateTripForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createTrip, initialFormState);
  const [location, setLocation] = useState<GeocodeResult | null>(null);
  const [country, setCountry] = useState("");
  const [city, setCity] = useState("");
  const [locationError, setLocationError] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-full bg-accent text-accent-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity"
      >
        + Nouveau voyage
      </button>
    );
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    if (!location) {
      e.preventDefault();
      setLocationError(true);
    }
  }

  return (
    <form action={formAction} onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 w-full">
      <p className="font-display text-lg text-primary">Nouveau voyage</p>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Titre" name="title" placeholder="Safari en Tanzanie" required />
        <div />

        <LocationSearch
          onSelect={(result) => {
            setLocation(result);
            setCountry(result.country);
            setCity(result.city);
            setLocationError(false);
          }}
        />
        {locationError && <p className="sm:col-span-2 text-sm text-red-700">Sélectionne un lieu dans la liste de résultats.</p>}

        <div className="flex flex-col gap-1">
          <label htmlFor="country" className="text-xs text-muted">
            Pays
          </label>
          <input
            id="country"
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            required
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="city" className="text-xs text-muted">
            Ville / région (optionnel)
          </label>
          <input
            id="city"
            name="city"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>

        <Field label="Date de début" name="start_date" type="date" required />
        <Field label="Date de fin (optionnel)" name="end_date" type="date" />
      </div>

      <input type="hidden" name="latitude" value={location?.latitude ?? ""} />
      <input type="hidden" name="longitude" value={location?.longitude ?? ""} />

      <div className="flex flex-col gap-1">
        <label htmlFor="summary" className="text-xs text-muted">
          Résumé (optionnel)
        </label>
        <textarea id="summary" name="summary" rows={2} className="bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none" />
      </div>

      {state.status === "error" && <p className="text-sm text-red-700">{state.message}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-full bg-primary text-primary-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity">
          Créer le voyage
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-foreground transition-colors">
          Annuler
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={name} className="text-xs text-muted">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
