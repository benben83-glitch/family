"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createFindChallenge(params: { mediaId: string; targetLabel: string; targetX: number; targetY: number }): Promise<{ error: string | null }> {
  const label = params.targetLabel.trim();
  if (!label) return { error: "Le libellé est requis." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("find_challenges").insert({
    media_id: params.mediaId,
    target_label: label,
    target_x: params.targetX,
    target_y: params.targetY,
    created_by: user?.id,
  });

  if (error) return { error: error.message };

  revalidatePath("/explorateurs/jeux/cherche-trouve");
  redirect("/explorateurs/jeux/cherche-trouve");
}

export async function deleteFindChallenge(challengeId: string): Promise<{ error: string | null }> {
  const supabase = await createClient();
  const { error } = await supabase.from("find_challenges").delete().eq("id", challengeId);
  if (error) return { error: error.message };

  revalidatePath("/explorateurs/jeux/cherche-trouve");
  return { error: null };
}
