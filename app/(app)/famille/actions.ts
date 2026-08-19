"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function approveMember(params: { profileId: string; role: "parent" | "adulte" }): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").update({ status: "active", role: params.role }).eq("id", params.profileId);
  if (error) return { error: error.message };

  revalidatePath("/famille");
  return { error: null };
}

export async function rejectMember(profileId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("profiles").delete().eq("id", profileId);
  if (error) return { error: error.message };

  revalidatePath("/famille");
  return { error: null };
}
