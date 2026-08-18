"use client";

import { useActionState, useState } from "react";
import { createTrip } from "./actions";
import { initialFormState } from "@/lib/forms/action-state";

export function CreateTripForm() {
  const [open, setOpen] = useState(false);
  const [state, formAction] = useActionState(createTrip, initialFormState);

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

  return (
    <form action={formAction} className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 w-full">
      <p className="font-display text-lg text-primary">Nouveau voyage</p>

      <div className="grid sm:grid-cols-2 gap-3">
        <Field label="Titre" name="title" placeholder="Safari en Tanzanie" required />
        <Field label="Pays" name="country" placeholder="Tanzanie" required />
        <Field label="Ville / région (optionnel)" name="city" placeholder="Serengeti" />
        <div />
        <Field label="Date de début" name="start_date" type="date" required />
        <Field label="Date de fin (optionnel)" name="end_date" type="date" />
        <Field label="Latitude" name="latitude" type="number" step="any" placeholder="-2.15" required />
        <Field label="Longitude" name="longitude" type="number" step="any" placeholder="34.68" required />
      </div>

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
  step,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  step?: string;
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
        step={step}
        placeholder={placeholder}
        required={required}
        className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
      />
    </div>
  );
}
