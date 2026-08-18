"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { slugify } from "@/lib/format/slugify";
import type { FormActionState } from "@/lib/forms/action-state";

export async function createTrip(prevState: FormActionState, formData: FormData): Promise<FormActionState> {
  const title = String(formData.get("title") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const startDate = String(formData.get("start_date") ?? "").trim();
  const endDate = String(formData.get("end_date") ?? "").trim();
  const summary = String(formData.get("summary") ?? "").trim();
  const latitude = Number(formData.get("latitude"));
  const longitude = Number(formData.get("longitude"));

  if (!title || !country || !startDate || Number.isNaN(latitude) || Number.isNaN(longitude)) {
    return { status: "error", message: "Titre, pays, date de début et coordonnées sont requis." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const baseSlug = slugify(`${title}-${country}`);
  let slug = baseSlug;
  for (let attempt = 1; attempt < 10; attempt++) {
    const { data: existing } = await supabase.from("trips").select("id").eq("slug", slug).maybeSingle();
    if (!existing) break;
    slug = `${baseSlug}-${attempt + 1}`;
  }

  const { error } = await supabase.from("trips").insert({
    slug,
    title,
    country,
    city: city || null,
    start_date: startDate,
    end_date: endDate || null,
    summary: summary || null,
    latitude,
    longitude,
    created_by: user?.id,
  });

  if (error) {
    return { status: "error", message: "Impossible de créer le voyage : " + error.message };
  }

  revalidatePath("/voyages");
  redirect(`/voyages/${slug}`);
}
