export type CoverImage = { url: string; alt?: string };

export type Trip = {
  id: string;
  slug: string;
  title: string;
  country: string;
  city: string | null;
  cover_image: CoverImage | null;
  start_date: string;
  end_date: string | null;
  summary: string | null;
  latitude: number;
  longitude: number;
};

export type TripDay = {
  id: string;
  trip_id: string;
  day_number: number;
  date: string | null;
  title: string;
  description: string | null;
};

export type Media = {
  id: string;
  trip_id: string;
  trip_day_id: string | null;
  type: "photo" | "video";
  storage_path: string;
  caption: string | null;
  is_favorite: boolean;
  sort_order: number;
  /** URL signée, résolue côté serveur juste avant l'affichage (bucket privé). */
  signedUrl: string | null;
};
