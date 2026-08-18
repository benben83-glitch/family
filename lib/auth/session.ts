import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type FamilyProfile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: "parent" | "adulte";
};

/**
 * Le compte auth existe (proxy.ts l'a déjà garanti) mais peut ne pas encore
 * avoir de ligne `profiles` (le trigger handle_new_user tourne à la création
 * du compte auth, pas avant) : on redirige vers /login plutôt que de planter.
 */
export async function requireFamilyProfile(): Promise<FamilyProfile> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, email, full_name, avatar_url, role")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) redirect("/login?error=profil-manquant");

  return profile as FamilyProfile;
}
