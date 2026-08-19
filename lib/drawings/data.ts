import { createClient } from "@/lib/supabase/server";
import type { Drawing } from "./types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type DrawingWithDetails = Drawing & {
  signedUrl: string | null;
  tripTitle: string | null;
  childName: string | null;
};

export async function listDrawings(): Promise<DrawingWithDetails[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("drawings")
    .select("*, trips(title), child_profiles(full_name)")
    .order("created_at", { ascending: false });

  const rows = (data ?? []) as (Drawing & { trips: { title: string } | null; child_profiles: { full_name: string } | null })[];
  if (rows.length === 0) return [];

  const paths = rows.map((row) => row.storage_path);
  const { data: signedUrls } = await supabase.storage.from("drawings").createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  const entries = (signedUrls ?? []).filter((entry) => entry.path && entry.signedUrl) as { path: string; signedUrl: string }[];
  const urlByPath = new Map(entries.map((entry) => [entry.path, entry.signedUrl]));

  return rows.map(({ trips, child_profiles, ...drawing }) => ({
    ...drawing,
    signedUrl: urlByPath.get(drawing.storage_path) ?? null,
    tripTitle: trips?.title ?? null,
    childName: child_profiles?.full_name ?? null,
  }));
}
