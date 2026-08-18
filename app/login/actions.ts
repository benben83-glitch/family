"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { FormActionState } from "@/lib/forms/action-state";

export async function signIn(prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/");

  if (!email || !password) {
    return { status: "error", message: "E-mail et mot de passe requis." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { status: "error", message: "E-mail ou mot de passe incorrect." };
  }

  redirect(next.startsWith("/") ? next : "/");
}
