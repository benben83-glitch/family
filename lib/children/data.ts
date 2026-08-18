import { createClient } from "@/lib/supabase/server";
import type { ChildProfile } from "./types";

export async function listChildProfiles(): Promise<ChildProfile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("child_profiles")
    .select("id, full_name, avatar_emoji, birth_date")
    .order("sort_order", { ascending: true });
  return data ?? [];
}
