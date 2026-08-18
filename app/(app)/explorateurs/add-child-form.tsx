"use client";

import { useActionState, useState } from "react";
import { createChildProfile } from "./actions";
import { initialFormState } from "@/lib/forms/action-state";

const EMOJI_CHOICES = ["🧒", "👧", "👦", "🦁", "🐯", "🐨", "🦊", "🐼"];

export function AddChildForm() {
  const [open, setOpen] = useState(false);
  const [avatar, setAvatar] = useState(EMOJI_CHOICES[0]);
  const [state, formAction] = useActionState(createChildProfile, initialFormState);

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="text-sm text-accent hover:underline">
        + Ajouter un profil enfant
      </button>
    );
  }

  return (
    <form action={formAction} className="bg-card border border-border rounded-xl p-4 flex flex-col gap-3 max-w-sm mx-auto">
      <input type="hidden" name="avatar_emoji" value={avatar} />

      <div className="flex flex-wrap gap-1.5 justify-center">
        {EMOJI_CHOICES.map((emoji) => (
          <button
            key={emoji}
            type="button"
            onClick={() => setAvatar(emoji)}
            className={`text-xl w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${avatar === emoji ? "bg-primary/20" : "hover:bg-primary/10"}`}
          >
            {emoji}
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="full_name" className="text-xs text-muted">
          Prénom
        </label>
        <input id="full_name" name="full_name" type="text" required className="bg-background border border-border rounded-lg px-3 py-2 text-sm" />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="birth_date" className="text-xs text-muted">
          Date de naissance (optionnel)
        </label>
        <input id="birth_date" name="birth_date" type="date" className="bg-background border border-border rounded-lg px-3 py-2 text-sm w-fit" />
      </div>

      {state.status === "error" && <p className="text-sm text-red-700">{state.message}</p>}

      <div className="flex items-center gap-3">
        <button type="submit" className="rounded-full bg-primary text-primary-foreground text-sm px-4 py-2 hover:opacity-90 transition-opacity">
          Ajouter
        </button>
        <button type="button" onClick={() => setOpen(false)} className="text-sm text-muted hover:text-foreground transition-colors">
          Annuler
        </button>
      </div>
    </form>
  );
}
