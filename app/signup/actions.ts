"use server";

import { createClient } from "@/lib/supabase/server";
import type { FormActionState } from "@/lib/forms/action-state";

export async function signUp(prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");

  if (!fullName || !email || !password) {
    return { status: "error", message: "Tous les champs sont requis." };
  }
  if (password.length < 6) {
    return { status: "error", message: "Le mot de passe doit faire au moins 6 caractères." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName, status: "pending" } },
  });

  if (error) {
    return { status: "error", message: "Impossible de créer le compte : " + error.message };
  }

  return { status: "success", message: "Compte créé ! Un parent doit maintenant l'approuver avant que tu puisses accéder au carnet." };
}
