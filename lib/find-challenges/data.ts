import { createClient } from "@/lib/supabase/server";
import type { FindChallenge } from "./types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export type FindChallengeWithPhoto = FindChallenge & { signedUrl: string; tripTitle: string };

export async function listFindChallenges(): Promise<FindChallengeWithPhoto[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("find_challenges")
    .select("*, media(storage_path, trips(title))")
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) return [];

  const rows = data as (FindChallenge & { media: { storage_path: string; trips: { title: string } | null } | null })[];
  const paths = rows.map((row) => row.media?.storage_path).filter((p): p is string => Boolean(p));
  const { data: signedUrls } = await supabase.storage.from("trip-media").createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  const urlByPath = new Map(signedUrls?.map((entry) => [entry.path, entry.signedUrl]) ?? []);

  return rows
    .map(({ media, ...challenge }) => ({
      ...challenge,
      signedUrl: media?.storage_path ? (urlByPath.get(media.storage_path) ?? null) : null,
      tripTitle: media?.trips?.title ?? "",
    }))
    .filter((challenge): challenge is FindChallengeWithPhoto => Boolean(challenge.signedUrl));
}
