import { NextResponse, type NextRequest } from "next/server";

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  address?: { country?: string; city?: string; town?: string; village?: string; municipality?: string };
};

export type GeocodeResult = {
  label: string;
  latitude: number;
  longitude: number;
  country: string;
  city: string;
};

/**
 * Proxy vers Nominatim (OpenStreetMap) : évite d'exposer un User-Agent
 * navigateur générique, requis par la politique d'usage de l'API publique
 * (https://operations.osmfoundation.org/policies/nominatim/).
 */
export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim();
  if (!q || q.length < 2) return NextResponse.json({ results: [] });

  const url = new URL("https://nominatim.openstreetmap.org/search");
  url.searchParams.set("q", q);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", "6");
  url.searchParams.set("accept-language", "fr");

  const response = await fetch(url, {
    headers: { "User-Agent": "family-travel-app/1.0 (usage familial prive)" },
  });

  if (!response.ok) return NextResponse.json({ results: [] });

  const data: NominatimResult[] = await response.json();
  const results: GeocodeResult[] = data.map((item) => ({
    label: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    country: item.address?.country ?? "",
    city: item.address?.city ?? item.address?.town ?? item.address?.village ?? item.address?.municipality ?? "",
  }));

  return NextResponse.json({ results });
}
