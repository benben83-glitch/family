"use client";

import { useActionState } from "react";
import { signIn } from "./actions";
import { initialFormState } from "@/lib/forms/action-state";

export function LoginForm({ next }: { next: string }) {
  const [state, formAction] = useActionState(signIn, initialFormState);

  return (
    <form action={formAction} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      <input type="hidden" name="next" value={next} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-medium text-foreground/85">
          E-mail
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          className="bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-medium text-foreground/85">
          Mot de passe
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2" role="alert">
          {state.message}
        </p>
      )}

      <button
        type="submit"
        className="mt-2 rounded-full bg-primary text-primary-foreground font-display tracking-wide text-sm py-2.5 hover:opacity-90 transition-opacity"
      >
        Se connecter
      </button>
    </form>
  );
}
