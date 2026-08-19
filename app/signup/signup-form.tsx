"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signUp } from "./actions";
import { initialFormState } from "@/lib/forms/action-state";

export function SignupForm() {
  const [state, formAction] = useActionState(signUp, initialFormState);

  if (state.status === "success") {
    return (
      <div className="bg-card border border-border rounded-2xl p-6 flex flex-col items-center gap-3 text-center">
        <span className="text-3xl">✅</span>
        <p className="text-sm">{state.message}</p>
        <Link href="/login" className="text-sm text-accent hover:underline">
          Aller à la connexion
        </Link>
      </div>
    );
  }

  return (
    <form action={formAction} className="bg-card border border-border rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="full_name" className="text-sm font-medium text-foreground/85">
          Prénom
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          required
          className="bg-background border border-border rounded-lg px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-accent"
        />
      </div>

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
          autoComplete="new-password"
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
        Demander à rejoindre
      </button>
    </form>
  );
}
