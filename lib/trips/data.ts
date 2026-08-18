import { createClient } from "@/lib/supabase/server";
import type { Media, Trip, TripDay } from "./types";

const SIGNED_URL_TTL_SECONDS = 60 * 60;

export async function listTrips(): Promise<Trip[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("trips").select("*").order("start_date", { ascending: false });
  return data ?? [];
}

export async function getTripBySlug(slug: string): Promise<Trip | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("trips").select("*").eq("slug", slug).maybeSingle();
  return data;
}

export async function listTripDays(tripId: string): Promise<TripDay[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("trip_days").select("*").eq("trip_id", tripId).order("day_number", { ascending: true });
  return data ?? [];
}

export async function listTripMedia(tripId: string): Promise<Media[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media")
    .select("*")
    .eq("trip_id", tripId)
    .order("sort_order", { ascending: true });

  if (!data || data.length === 0) return [];

  const paths = data.map((item) => item.storage_path);
  const { data: signedUrls } = await supabase.storage.from("trip-media").createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  const urlByPath = new Map(signedUrls?.map((entry) => [entry.path, entry.signedUrl]) ?? []);

  return data.map((item) => ({ ...item, signedUrl: urlByPath.get(item.storage_path) ?? null }));
}

export async function listRecentMedia(limit: number): Promise<(Media & { tripTitle: string; tripSlug: string })[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("media")
    .select("*, trips(title, slug)")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data || data.length === 0) return [];

  const paths = data.map((item) => item.storage_path);
  const { data: signedUrls } = await supabase.storage.from("trip-media").createSignedUrls(paths, SIGNED_URL_TTL_SECONDS);
  const urlByPath = new Map(signedUrls?.map((entry) => [entry.path, entry.signedUrl]) ?? []);

  return data.map((item) => {
    const { trips, ...media } = item as typeof item & { trips: { title: string; slug: string } };
    return { ...media, signedUrl: urlByPath.get(media.storage_path) ?? null, tripTitle: trips.title, tripSlug: trips.slug };
  });
}
