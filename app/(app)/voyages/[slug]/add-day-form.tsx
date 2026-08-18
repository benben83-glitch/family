"use client";

import { useActionState, useRef, useEffect } from "react";
import { addTripDay } from "./actions";
import { initialFormState } from "@/lib/forms/action-state";

export function AddDayForm({ tripId, tripSlug, nextDayNumber }: { tripId: string; tripSlug: string; nextDayNumber: number }) {
  const [state, formAction] = useActionState(addTripDay, initialFormState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3">
      <input type="hidden" name="trip_id" value={tripId} />
      <input type="hidden" name="trip_slug" value={tripSlug} />

      <p className="font-display text-lg text-primary">Ajouter un jour</p>

      <div className="grid sm:grid-cols-[100px_1fr] gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor="day_number" className="text-xs text-muted">
            Jour n°
          </label>
          <input
            id="day_number"
            name="day_number"
            type="number"
            min={1}
            defaultValue={nextDayNumber}
            required
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="title" className="text-xs text-muted">
            Titre
          </label>
          <input
            id="title"
            name="title"
            type="text"
            placeholder="Arrivée, Safari, Plage…"
            required
            className="bg-background border border-border rounded-lg px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="date" className="text-xs text-muted">
          Date (optionnel)
        </label>
        <input id="date" name="date" type="date" className="bg-background border border-border rounded-lg px-3 py-2 text-sm w-fit" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-xs text-muted">
          Anecdote / description
        </label>
        <textarea
          id="description"
          name="description"
          rows={2}
          className="bg-background border border-border rounded-lg px-3 py-2 text-sm resize-none"
        />
      </div>

      {state.status === "error" && <p className="text-sm text-red-700">{state.message}</p>}

      <button
        type="submit"
        className="self-start rounded-full bg-primary text-primary-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity"
      >
        Ajouter ce jour
      </button>
    </form>
  );
}
